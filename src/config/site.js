export const siteConfig = {
  name: 'VLife Wrapper',
  description: 'A modern Next.js application with authentication and internationalization',
  url: 'https://vlifewrapper.com',
  ogImage: 'https://vlifewrapper.com/og.jpg',
  links: {
    twitter: 'https://twitter.com/vlifewrapper',
    github: 'https://github.com/vlifewrapper',
  },
  author: {
    name: 'VLife Team',
    email: 'team@vlifewrapper.com',
  },
};

export const appConfig = {
  defaultTheme: 'light',
  defaultLocale: 'en',
  supportedLocales: ['en', 'ur'],
  apiTimeout: 30000, // 30 seconds
  maxFileSize: 10 * 1024 * 1024, // 10MB
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },
};
