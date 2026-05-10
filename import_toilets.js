const axios = require('axios');
const fs    = require('fs');
const path  = require('path');

// ── การตั้งค่า ────────────────────────────────────────────────
const OUTPUT_FILE = path.join(__dirname, 'toilets_import.sql');

// คำสั่ง Overpass QL ดึงพิกัดห้องน้ำในประเทศไทย
// ใช้ timeout 300 วินาที เพราะข้อมูลระดับประเทศมีขนาดใหญ่
const overpassQuery = `
    [out:json][timeout:300];
    area["ISO3166-1"="TH"][admin_level=2]->.searchArea;
    node["amenity"="toilets"](area.searchArea);
    out center;
`;

// ── จำนวน rows ต่อ 1 INSERT statement ───────────────────────
const BATCH_SIZE = 500;

// ── Reverse geocoding ผ่าน Nominatim (1 req/sec ตาม policy) ──
// ตั้งเป็น true เพื่อดึงชื่อถนนสำหรับห้องน้ำที่ไม่มีชื่อ (ใช้เวลานานขึ้น)
const ENABLE_GEOCODING = true;
const GEOCODE_DELAY_MS = 1100; // 1.1 วินาทีเพื่อความปลอดภัย

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function reverseGeocode(lat, lng) {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: { format: 'json', lat, lon: lng, zoom: 17, addressdetails: 1 },
        headers: { 'User-Agent': 'NodeJS-Toilet-Import-Script/1.0 (polawathuang@gmail.com)' },
        timeout: 10000,
    });
    const addr = res.data.address || {};
    const road     = addr.road || addr.pedestrian || addr.footway || addr.path || null;
    const suburb   = addr.suburb || addr.neighbourhood || addr.quarter || null;
    const district = addr.city_district || addr.district || null;
    const city     = addr.city || addr.town || addr.village || null;

    if (road) {
        const parts = [`ห้องน้ำ ถ.${road}`];
        if (suburb)   parts.push(`แขวง${suburb}`);
        if (district) parts.push(`เขต${district}`);
        else if (city) parts.push(city);
        return parts.join(' ');
    }
    if (suburb)   return `ห้องน้ำ ย่าน${suburb}`;
    if (district) return `ห้องน้ำ เขต${district}`;
    if (city)     return `ห้องน้ำ ${city}`;
    return null; // ไม่พบข้อมูล ใช้ค่าเริ่มต้น
}

// ── escape string สำหรับ SQL ──────────────────────────────────
function escapeSql(value) {
    if (value === null || value === undefined) return 'NULL';
    return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

// ── สร้างชื่อที่ดีจาก OSM tags ───────────────────────────────
function buildName(tags) {
    // ลำดับความสำคัญ: ชื่อภาษาไทย > ชื่อทั่วไป > ชื่อภาษาอังกฤษ > ผู้ดำเนินการ > ค่าเริ่มต้น
    if (tags['name:th'])  return tags['name:th'];
    if (tags.name)        return tags.name;
    if (tags['name:en'])  return `ห้องน้ำ ${tags['name:en']}`;
    if (tags.operator)    return `ห้องน้ำ ${tags.operator}`;
    if (tags.brand)       return `ห้องน้ำ ${tags.brand}`;
    return 'ห้องน้ำสาธารณะ';
}

// ── สร้างที่อยู่จาก OSM addr: tags ───────────────────────────
function buildAddress(tags) {
    if (tags['addr:full']) return tags['addr:full'];

    const parts = [
        tags['addr:housenumber'],
        tags['addr:street'] || tags['addr:road'],
        tags['addr:subdistrict'] ? `ต.${tags['addr:subdistrict']}` : null,
        tags['addr:district']    ? `อ.${tags['addr:district']}`    : null,
        tags['addr:city']        || (tags['addr:province'] ? `จ.${tags['addr:province']}` : null),
        tags['addr:postcode'],
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' ') : null;
}

// ── สร้าง description จาก OSM tags ───────────────────────────
function buildDescription(tags) {
    const parts = [];
    if (tags.description)         parts.push(tags.description);
    if (tags.note)                parts.push(tags.note);
    if (tags['toilets:disposal']) parts.push(`ระบบ: ${tags['toilets:disposal']}`);
    if (tags.male === 'yes' && tags.female === 'yes') parts.push('ชาย/หญิง');
    else if (tags.male === 'yes')   parts.push('ชาย');
    else if (tags.female === 'yes') parts.push('หญิง');
    if (tags.changing_table === 'yes') parts.push('มีที่เปลี่ยนผ้าอ้อม');
    if (tags.shower === 'yes')         parts.push('มีห้องอาบน้ำ');
    // access=yes/public = สาธารณะปกติ ไม่ต้องแสดง | ค่าอื่นๆ มีประโยชน์
    const SKIP_ACCESS = new Set(['yes', 'public', 'permissive']);
    if (tags.access && !SKIP_ACCESS.has(tags.access)) {
        const labels = { customers: 'เฉพาะลูกค้า', private: 'ไม่เปิดสาธารณะ', destination: 'เฉพาะผู้มีธุระ' };
        parts.push(labels[tags.access] || `การเข้าถึง: ${tags.access}`);
    }
    return parts.length > 0 ? parts.join(' | ') : null;
}

async function main() {
    try {
        // 1. ดึงข้อมูลจาก OpenStreetMap
        console.log("1. กำลังดึงข้อมูลจาก OpenStreetMap (อาจใช้เวลา 1-3 นาที)...");
        const params = new URLSearchParams();
        params.append('data', overpassQuery);

        const overpassRes = await axios.post(
            'https://overpass-api.de/api/interpreter',
            params,
            { 
                timeout: 360000,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'NodeJS-Toilet-Import-Script/1.0 (polawathuang@gmail.com)'
                }
            }
        );

        const elements = overpassRes.data.elements;
        console.log(`   ดึงข้อมูลสำเร็จ! พบจุดห้องน้ำทั้งหมด ${elements.length} แห่ง`);

        // 2. กรองเฉพาะจุดที่มีพิกัด
        const valid = elements.filter(el => el.lat && el.lon);
        console.log(`2. สร้าง SQL สำหรับ ${valid.length} จุด (ข้าม ${elements.length - valid.length} จุดที่ไม่มีพิกัด)...`);

        // สถิติ
        let namedCount = 0, withAddressCount = 0, withDescCount = 0, geocodedCount = 0;

        // 3. แปลงเป็น rows (geocode ห้องน้ำที่ไม่มีชื่อ)
        const rows = [];
        for (let i = 0; i < valid.length; i++) {
            const el   = valid[i];
            const tags = el.tags || {};

            let name = buildName(tags);

            // Reverse geocode เฉพาะที่ไม่มีชื่อ
            if (name === 'ห้องน้ำสาธารณะ' && ENABLE_GEOCODING) {
                try {
                    const geoName = await reverseGeocode(el.lat, el.lon);
                    if (geoName) { name = geoName; geocodedCount++; }
                } catch (e) {
                    // ถ้า geocode ล้มเหลวให้ใช้ค่าเริ่มต้น
                }
                await sleep(GEOCODE_DELAY_MS);
            }

            const description  = buildDescription(tags);
            const address      = buildAddress(tags);
            const hasFee       = tags.fee === 'yes' ? 1 : 0;
            const isWheelchair = tags.wheelchair === 'yes' ? 1 : 0;
            const openingHours = tags.opening_hours || null;

            if (name !== 'ห้องน้ำสาธารณะ') namedCount++;
            if (address)     withAddressCount++;
            if (description) withDescCount++;

            rows.push(`(${escapeSql(name)}, ${escapeSql(description)}, ${escapeSql(address)}, ${el.lat}, ${el.lon}, 'active', ${hasFee}, ${isWheelchair}, ${escapeSql(openingHours)})`);

            if ((i + 1) % 50 === 0) {
                console.log(`   ประมวลผลแล้ว ${i + 1} / ${valid.length} จุด${ENABLE_GEOCODING ? ` (geocoded: ${geocodedCount})` : ''}...`);
            }
        }

        // 4. เขียนไฟล์ SQL
        const writeStream = fs.createWriteStream(OUTPUT_FILE, { encoding: 'utf8' });

        writeStream.write(`-- Toilet import from OpenStreetMap (Thailand)\n`);
        writeStream.write(`-- Generated: ${new Date().toISOString()}\n`);
        writeStream.write(`-- Total records: ${valid.length}\n`);
        writeStream.write(`-- Named: ${namedCount} | With address: ${withAddressCount} | With description: ${withDescCount}\n\n`);
        writeStream.write(`SET NAMES utf8mb4;\n`);
        writeStream.write(`SET foreign_key_checks = 0;\n\n`);

        // เขียน batch ละ BATCH_SIZE rows
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE);
            writeStream.write(
                `INSERT IGNORE INTO toilets (name, description, address, lat, lng, status, has_fee, is_wheelchair_accessible, opening_hours)\nVALUES\n`
                + batch.join(',\n')
                + `;\n\n`
            );
            if (i % (BATCH_SIZE * 10) === 0 && i > 0) {
                console.log(`   เขียน SQL แล้ว ${i} / ${rows.length} แถว...`);
            }
        }

        writeStream.write(`SET foreign_key_checks = 1;\n`);

        await new Promise((resolve, reject) => {
            writeStream.end(err => err ? reject(err) : resolve());
        });

        console.log(`\n✅ สำเร็จ! สร้างไฟล์ SQL แล้ว: ${OUTPUT_FILE}`);
        console.log(`   - มีชื่อจริง: ${namedCount} จุด (${Math.round(namedCount/valid.length*100)}%)`);
        if (ENABLE_GEOCODING) console.log(`   - geocoded: ${geocodedCount} จุด`);
        console.log(`   - มีที่อยู่: ${withAddressCount} จุด (${Math.round(withAddressCount/valid.length*100)}%)`);
        console.log(`   - มี description: ${withDescCount} จุด (${Math.round(withDescCount/valid.length*100)}%)`);
        console.log(`\n   รัน: mysql -u <user> -p <database> < toilets_import.sql`);

    } catch (error) {
        if (error.response) {
            console.error("เกิดข้อผิดพลาด:", error.response.status, error.response.data);
        } else {
            console.error("เกิดข้อผิดพลาด:", error.message);
        }
        process.exit(1);
    }
}

main();