const SITE_URL = 'https://www.xn--12clh6d4ceub3cdb2qwc.com';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host:     SITE_URL,
  };
}
