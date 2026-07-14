import type { ReactNode } from 'react';

export const metadata = {
  title: 'Skelly',
  description: 'Commercial operating system for bid & tender teams',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
