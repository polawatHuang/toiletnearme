import './globals.css';
import Providers from '@/components/Providers';

const SITE_URL  = 'https://www.xn--12clh6d4ceub3cdb2qwc.com';
const SITE_NAME = 'แวะจุดขี้ – หาห้องน้ำทั่วประเทศไทย';
const DESCRIPTION =
  'ค้นหาห้องน้ำสาธารณะทั่วประเทศไทยได้ฟรี ดูรีวิว คะแนน ที่อยู่ เวลาเปิด-ปิด และระยะทาง ใกล้คุณตอนนี้ เช่น ห้องน้ำสยาม อโศก ลาดกระบัง ฯลฯ';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  `${SITE_NAME} 🚽`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    'ห้องน้ำใกล้ฉัน', 'หาห้องน้ำ', 'toilet near me', 'ห้องน้ำสาธารณะ',
    'ห้องน้ำสะอาด', 'แผนที่ห้องน้ำ', 'toilet map thailand',
    'ห้องน้ำกรุงเทพ', 'ห้องน้ำฟรี', 'แวะจุดขี้',
  ],
  authors:   [{ name: 'แวะจุดขี้', url: SITE_URL }],
  creator:   'แวะจุดขี้',
  publisher: 'แวะจุดขี้',
  category:  'travel',

  /* ── Open Graph ──────────────────────────────────────────── */
  openGraph: {
    type:        'website',
    locale:      'th_TH',
    url:          SITE_URL,
    siteName:     SITE_NAME,
    title:       `${SITE_NAME} 🚽`,
    description:  DESCRIPTION,
    images: [
      {
        url:    '/og-image.png',
        width:   1200,
        height:  630,
        alt:    'แวะจุดขี้ – แผนที่ห้องน้ำทั่วไทย',
      },
    ],
  },

  /* ── Twitter Card ────────────────────────────────────────── */
  twitter: {
    card:        'summary_large_image',
    site:        '@waejudkee',
    creator:     '@waejudkee',
    title:       `${SITE_NAME} 🚽`,
    description:  DESCRIPTION,
    images:      ['/og-image.png'],
  },

  /* ── Robots ──────────────────────────────────────────────── */
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  /* ── Canonical / alternates ─────────────────────────────── */
  alternates: {
    canonical: SITE_URL,
    languages: { 'th-TH': SITE_URL },
  },

  /* ── Icons ───────────────────────────────────────────────── */
  icons: {
    icon:        '/favicon.ico',
    shortcut:    '/favicon-32x32.png',
    apple:       '/apple-touch-icon.png',
  },

  /* ── Verification ────────────────────────────────────────── */
  // verification: { google: 'YOUR_GOOGLE_SITE_VERIFICATION_ID' },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type':    'WebApplication',
    name:        SITE_NAME,
    url:         SITE_URL,
    description: DESCRIPTION,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'THB' },
    inLanguage: 'th',
    areaServed: {
      '@type': 'Country',
      name: 'Thailand',
      sameAs: 'https://www.wikidata.org/wiki/Q869',
    },
  };

  return (
    <html lang="th">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="theme-color" content="#0891b2" />
        <meta name="mobile-web-app-capable"      content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

