import { Providers } from './providers';
import { ConditionalHeader } from '@/components/layout/ConditionalHeader';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import './globals.css';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'VLife Wrapper',
  description: 'A modern Next.js application with beautiful UI components',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove bis_skin_checked attribute that can cause hydration warnings
              (function() {
                if (typeof window !== 'undefined') {
                  const removeBisSkinChecked = () => {
                    const elements = document.querySelectorAll('[bis_skin_checked]');
                    elements.forEach(el => el.removeAttribute('bis_skin_checked'));
                  };
                  
                  // Remove immediately if DOM is ready
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', removeBisSkinChecked);
                  } else {
                    removeBisSkinChecked();
                  }
                  
                  // Also remove on hydration
                  setTimeout(removeBisSkinChecked, 0);
                }
              })();
            `,
          }}
        />
      </head>
      <body 
        className={`${poppins.variable} font-sans`} 
        suppressHydrationWarning
        suppressContentEditableWarning
      >
        <Providers>
          <ConditionalHeader />
          <AuthenticatedLayout>
            {children}
          </AuthenticatedLayout>
        </Providers>
      </body>
    </html>
  );
}
