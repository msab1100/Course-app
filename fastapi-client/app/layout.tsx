import { ReactNode } from 'react';
import ThemeRegistry from '../src/providers/ThemeRegistry';
import AuthProvider from '../src/providers/AuthProvider';
import AdminBar from '../components/AdminBar';

export const metadata = {
  title: 'Course App',
  description: 'FastAPI + Next.js + MUI',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AuthProvider>
            <AdminBar />
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
