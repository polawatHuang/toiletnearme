const SITE_URL = 'https://www.xn--12clh6d4ceub3cdb2qwc.com';

export default function sitemap() {
  return [
    {
      url:              SITE_URL,
      lastModified:     new Date(),
      changeFrequency:  'daily',
      priority:         1,
    },
    {
      url:              `${SITE_URL}/login`,
      lastModified:     new Date(),
      changeFrequency:  'monthly',
      priority:         0.3,
    },
    {
      url:              `${SITE_URL}/register`,
      lastModified:     new Date(),
      changeFrequency:  'monthly',
      priority:         0.3,
    },
  ];
}
