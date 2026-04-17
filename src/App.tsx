/**
 *  App.tsx
 *
 *  @copyright 2024 Digital Aid Seattle
 *
 */
import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import {
  AuthServiceProvider,
  StorageServiceProvider,
  UserContextProvider
} from "@digitalaidseattle/core";
import { LayoutConfigurationProvider } from "@digitalaidseattle/mui";
import { SupabaseAuthService, SupabaseStorageService } from '@digitalaidseattle/supabase';

// project import
import { initConfiguration } from './api/configuration';
import { routes } from './pages/routes';
import { TemplateConfig } from './TemplateConfig';

// Styles
import "./App.css";

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const router = createBrowserRouter(routes);

const App: React.FC = () => {

  initConfiguration(
    {
      projectUrl: import.meta.env.VITE_SUPABASE_URL,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
    }
  );

  return (
    <AuthServiceProvider authService={new SupabaseAuthService()} >
      <StorageServiceProvider storageService={new SupabaseStorageService()} >
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
