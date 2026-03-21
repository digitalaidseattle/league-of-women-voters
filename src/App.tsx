/**
 *  App.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React, { useEffect, useState } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import {
  AuthServiceProvider,
  StorageServiceProvider,
  UserContextProvider
} from "@digitalaidseattle/core";
import { LayoutConfigurationProvider } from "@digitalaidseattle/mui";
import { SupabaseAuthService, SupabaseStorageService } from '@digitalaidseattle/supabase';

// project import
import { BillService } from "./api/billService";
import { LegislatureService } from "./api/legislatureService";
import "./App.css";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { routes } from './pages/routes';
import { TemplateConfig } from './TemplateConfig';
import { initConfiguration } from './api/configuration';

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const router = createBrowserRouter(routes);

const App: React.FC = () => {

  initConfiguration(
    {
      projectUrl: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
    }
  );

  const [initialized, setInitialized] = useState(false);
  // This fills the cache
  useEffect(() => {
    if (!initialized) {
      Promise.all([
        BillService.getInstance().refreshCache(),
        LegislatureService.getInstance().refreshCache()
      ])
        .catch(error => console.error(error))
        .finally(() => setInitialized(true));
    }
  }, [])

  return (
    <AuthServiceProvider authService={new SupabaseAuthService()} >
      <StorageServiceProvider storageService={new SupabaseStorageService()} >
        <UserContextProvider>
          <LayoutConfigurationProvider configuration={TemplateConfig()}>
            <LoadingOverlay loading={!initialized} />
            {initialized && <RouterProvider router={router} />}
          </LayoutConfigurationProvider>
        </UserContextProvider>
      </StorageServiceProvider>
    </AuthServiceProvider>
  );
}

export default App;
