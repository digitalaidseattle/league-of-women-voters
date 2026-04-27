/**
 *  App.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React, { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import {
  AuthServiceProvider,
  setCoreServices,
  StorageServiceProvider,
  UserContextProvider
} from "@digitalaidseattle/core";
import { LayoutConfigurationProvider } from "@digitalaidseattle/mui";
import { SupabaseAuthService, SupabaseConfiguration, SupabaseStorageService } from '@digitalaidseattle/supabase';

// project import
import { routes } from './pages/routes';
import { TemplateConfig } from './TemplateConfig';

// Styles
import "./App.css";
import { FirebaseConfiguration } from './api/screen-scraped/FirebaseConfiguration';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const router = createBrowserRouter(routes);

const App: React.FC = () => {
  const [initialized, setInitialized] = React.useState<boolean>(false);

  useEffect(() => {
    configure();
  }, []);

  function configure() {
    SupabaseConfiguration.props({
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
    });

    FirebaseConfiguration.props({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    });

    setCoreServices({
      authService: SupabaseAuthService.getInstance(),
      storageService: SupabaseStorageService.getInstance()
    })

    setInitialized(true);

  }
  return (initialized &&
    <AuthServiceProvider authService={SupabaseAuthService.getInstance()} >
      <StorageServiceProvider storageService={SupabaseStorageService.getInstance()} >
        <UserContextProvider>
          <LayoutConfigurationProvider configuration={TemplateConfig()}>
            <RouterProvider router={router} />
          </LayoutConfigurationProvider>
        </UserContextProvider>
      </StorageServiceProvider>
    </AuthServiceProvider>
  );
}

export default App;
