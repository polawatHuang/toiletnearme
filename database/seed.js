/**
 * database/seed.js
 * Run: node database/seed.js
 * Creates admin user + sample Bangkok toilet data
 */
require('dotenv').config({ path: './backend/.env' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'toiletnearme',
  });

  console.log('🌱 Seeding database...');

  // ── Admin user ──────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@123', 12);
  await conn.query(`
    INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
  `, ['Admin', 'admin@toiletnearme.com', adminHash, 'admin']);
  console.log('✔  Admin user  → admin@toiletnearme.com / Admin@123');

  // ── Sample user ─────────────────────────────────────────────
  const userHash = await bcrypt.hash('User@123', 12);
  await conn.query(`
    INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
  `, ['สมชาย ใจดี', 'user@toiletnearme.com', userHash, 'user']);
  console.log('✔  Sample user → user@toiletnearme.com / User@123');

  // ── Get admin id ─────────────────────────────────────────────
  const [[admin]] = await conn.query(`SELECT id FROM users WHERE email = ?`, ['admin@toiletnearme.com']);
  const adminId = admin.id;

  // ── Sample toilets (Bangkok area) ───────────────────────────
  const toilets = [
    ['ห้องน้ำสยามพารากอน',      'ห้องน้ำสะอาดมาก มีเจ้าหน้าที่ทำความสะอาดตลอด 24 ชั่วโมง ชั้น B1 ติดกับซูเปอร์มาร์เก็ต', 'สยามพารากอน ถนนพระรามที่ 1 ปทุมวัน กรุงเทพ', 13.74632, 100.53463, 4.80, 24, 'active', 1, 5.00, 1, '10:00–22:00', adminId],
    ['ห้องน้ำ MBK Center',       'ห้องน้ำทุกชั้น ครบครัน ทำความสะอาดสม่ำเสมอ มีห้องน้ำสำหรับคนพิการ',                     'MBK Center ถนนพระรามที่ 1 ปทุมวัน กรุงเทพ',    13.74431, 100.52953, 4.20, 18, 'active', 0, null, 1, '10:00–22:00', adminId],
    ['ห้องน้ำ BTS สถานีอโศก',    'ห้องน้ำบริเวณชานชาลา BTS สะอาด เปิดตามเวลารถไฟฟ้า',                                      'สถานี BTS อโศก สุขุมวิท กรุงเทพ',              13.74059, 100.56101, 3.70, 12, 'active', 0, null, 1, '05:30–00:00', adminId],
    ['ห้องน้ำสวนลุมพินี',        'ห้องน้ำสาธารณะในสวนลุมพินี มีหลายจุด ฟรี',                                              'สวนลุมพินี ถนนพระราม 4 ลุมพินี กรุงเทพ',      13.72892, 100.54165, 3.90, 31, 'active', 0, null, 0, '04:30–21:00', adminId],
    ['ห้องน้ำ Terminal 21 อโศก', 'ห้องน้ำธีมต่างประเทศในแต่ละชั้น ดีไซน์สวย สะอาดมาก ไม่มีค่าใช้จ่าย',                   'Terminal 21 ถนนสุขุมวิท อโศก กรุงเทพ',         13.73815, 100.56001, 4.90, 45, 'active', 0, null, 1, '10:00–22:00', adminId],
    ['ห้องน้ำ CentralWorld',      'ห้องน้ำสะอาด กว้างขวาง อยู่ทุกชั้น มีพนักงานดูแล',                                      'CentralWorld ปทุมวัน กรุงเทพ',                 13.74712, 100.53964, 4.50, 20, 'active', 0, null, 1, '10:00–22:00', adminId],
    ['ห้องน้ำสวนจตุจักร',        'ห้องน้ำสาธารณะในตลาดนัดจตุจักร มีหลายจุด',                                               'ตลาดนัดจตุจักร จตุจักร กรุงเทพ',               13.79920, 100.55028, 3.20, 9,  'active', 1, 3.00, 0, 'เสาร์-อาทิตย์ 09:00–18:00', adminId],
    ['ห้องน้ำไอคอนสยาม',         'ห้องน้ำระดับ 5 ดาว สะอาดมาก ออกแบบสวยงาม',                                               'ICONSIAM ถนนเจริญนคร คลองสาน กรุงเทพ',         13.72686, 100.51244, 4.95, 38, 'active', 0, null, 1, '10:00–22:00', adminId],
  ];

  for (const t of toilets) {
    await conn.query(`
      INSERT IGNORE INTO toilets
        (name,description,address,lat,lng,avg_rating,review_count,status,has_fee,fee_amount,is_wheelchair_accessible,opening_hours,user_id)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, t);
  }
  console.log(`✔  ${toilets.length} sample toilets inserted`);

  await conn.end();
  console.log('🎉 Seeding complete!');
}

seed().catch(err => { console.error(err); process.exit(1); });
