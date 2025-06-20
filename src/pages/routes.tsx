import DashboardDefault from './dashboard';
import CommitteesPage from './extra-pages/CommitteesPage';

import {
  Error,
  Login,
  MainLayout,
  MarkdownPage,
  MinimalLayout
} from "@digitalaidseattle/mui";
import CommitteePage from './extra-pages/CommitteePage';
import SponsorsPage from './extra-pages/SponsorsPage';

const routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <DashboardDefault />,
      },
      {
        path: "committees-page",
        element: <CommitteesPage />,
      },
      {
        path: "committee-page",
        element: <CommitteePage />,
      },
      {
        path: "sponsors-page",
        element: <SponsorsPage />,
      },
      {
        path: "privacy",
        element: <MarkdownPage filepath='privacy.md'/>,
      }
    ]
  },
  {
    path: "/",
    element: <MinimalLayout />,
    children: [
      {
        path: 'login',
        element: <Login />
      }
    ]
  },
  {
    path: "*",
    element: <MinimalLayout />,
    children: [
      {
        path: '*',
        element: <Error />
      }
    ]
  }
];

export { routes };
