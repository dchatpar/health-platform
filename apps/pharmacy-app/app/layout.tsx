import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeRegistry } from '@/theme/ThemeProvider';
import { Sidebar } from '@/components/common/Sidebar';
import { Box } from '@mui/material';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Health Plus Pharmacy',
  description: 'Pharmacy management system for healthcare platform',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers>
            <ThemeRegistry>
              <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar />
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    bgcolor: 'background.default',
                  }}
                >
                  {children}
                </Box>
              </Box>
            </ThemeRegistry>
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}