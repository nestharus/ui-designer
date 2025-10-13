// Ensure Font Awesome styles are available during SSR and prevent client-side auto-injection
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';

import '../styles/globals.css';
import EmotionRegistry from './emotion-registry';
import { Providers } from './providers';

import type { Metadata } from 'next';

// Disable auto CSS injection on the client; we import styles explicitly above
config.autoAddCss = false;

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
          <div data-testid="app-root">
            <Providers>{children}</Providers>
          </div>
        </EmotionRegistry>
      </body>
    </html>
  );
}
