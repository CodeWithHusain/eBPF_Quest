export default function robots() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://bpfquest.dev';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/profile/',
        '/settings/',
        '/auth/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
