/* @refresh reload */
import './index.css';
import 'solid-devtools';

import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';
import { Toaster } from 'solid-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import App from './App';
import { routes } from './lib/routes';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

const client = new QueryClient();

render(
  () => (
    <QueryClientProvider client={client}>
      <Router
        root={(props) => (
          <>
            {/*// @ts-ignore*/}
            <App>{props.children}</App>
            <Toaster
              position='top-right' gutter={10} containerStyle={{
                top: "calc(env(safe-area-inset-top) + 16px)",
                right: "calc(env(safe-area-inset-right) + 16px)",
              }} toastOptions={{
                duration: 2000,
                className: 'bg-white text-slate-800',
              }}
            />
          </>
        )}
      >
        {routes}
      </Router>
    </QueryClientProvider>
  ),
  root!,
);
