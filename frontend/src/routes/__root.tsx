import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import './i18n';

import { LanguageSelector } from '#/components/language/LanguageSelector';
import { ThemeProvider } from '#/components/ThemeProvider';
import { ThemeToggle } from '#/components/ThemeToggle';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'uumly',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Elms+Sans:ital,wght@0,100..900;1,100..900&display=swap',
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body className='flex flex-col bg-emerald-100 dark:bg-emerald-900 dark:text-white prose dark:prose-invert prose-zinc w-screen min-w-screen h-screen min-h-screen elms-sans-uumly'>
        <ThemeProvider defaultTheme='light' storageKey='uumly-ui-theme'>
          <div className='flex flex-row justify-end gap-2 p-2 border-b border-emerald-300 dark:border-emerald-950 items-center'>
            <LanguageSelector />
            <ThemeToggle />
          </div>

          {children}
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  );
}
