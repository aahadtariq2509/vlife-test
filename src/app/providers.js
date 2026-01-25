'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { NoSSR } from '@/components/NoSSR';
import LoadingScreen from '@/components/ui/LoadingScreen';

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <NoSSR fallback={<LoadingScreen />}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <ThemeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </PersistGate>
      </NoSSR>
    </Provider>
  );
}
