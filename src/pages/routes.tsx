/**
 *  Routes.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import {
  Error,
  Login,
  MainLayout,
  MarkdownPage,
  MinimalLayout
} from "@digitalaidseattle/mui";
import { AdminPage } from "./AdminPage";
import { BillPage } from "./BillPage";
import { BillsPage } from "./BillsPage";
import CommitteePage from './CommitteePage';
import CommitteesPage from './CommitteesPage';
import SponsorPage from './LegislatorPage';
import { LegislatorsPage } from './LegislatorsPage';

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
        path: "committee/:id",
        element: <CommitteePage />,
      },
      {
        path: "bills",
        element: <BillsPage />,
      },
      {
        path: "bill/:id",
        element: <BillPage />,
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
