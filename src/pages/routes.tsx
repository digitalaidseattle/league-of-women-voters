import CommitteesPage from './extra-pages/CommitteesPage';

import {
  Error,
  Login,
  MainLayout,
  MarkdownPage,
  MinimalLayout
} from "@digitalaidseattle/mui";
import CommitteePage from './extra-pages/CommitteePage';
import BillsPage from './extra-pages/BillsPage';
import BillDetailPage from './extra-pages/BillDetailPage';
import SponsorPage from './extra-pages/LegislatorPage';
import { LegislatorsPage } from './extra-pages/LegislatorsPage';
import { AdminPage } from './AdminPage';

const routes = [
  {
    path: "/",
    element: <MainLayout sx={{ p: 1 }} />,
    children: [
      {
        path: "",
        element: <CommitteesPage />,
      },
      {
        path: "committees",
        element: <CommitteesPage />,
      },
      {
        path: "committee",
        element: <CommitteePage />,
      },
      {
        path: "bills",
        element: <BillsPage />,
      },
      {
        path: "bill",
        element: <BillDetailPage />,
      },
      {
        path: "legislators",
        element: <LegislatorsPage />,
      },
      {
        path: "legislator/:id",
        element: <SponsorPage />,
      },
      {
        path: "admin",
        element: <AdminPage />,
      },
      {
        path: "privacy",
        element: <MarkdownPage filepath='privacy.md' />,
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
