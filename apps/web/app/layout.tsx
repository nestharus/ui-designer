import EmotionRegistry from './emotion-registry';
import { Providers } from './providers';

import type { Metadata } from 'next';

import '../../../styles/globals.css';

export const metadata: Metadata = {
  title: 'UI Designer - Agentic Design Collaboration',
  description: 'A platform for dialectical workflows between human designers and AI design agents',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body>
        <EmotionRegistry>
          <Providers>{children}</Providers>
        </EmotionRegistry>
      </body>
    </html>
  );
}
