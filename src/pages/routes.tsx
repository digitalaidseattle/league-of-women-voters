import {
  Error,
  Login,
  MainLayout,
  MarkdownPage,
  MinimalLayout
} from "@digitalaidseattle/mui";
import CommitteePage from './CommitteePage';
import CommitteesPage from './CommitteesPage';
import SponsorPage from './extra-pages/LegislatorPage';
import { LegislatorsPage } from './LegislatorsPage';
import { BillsPage } from "./extra-pages/BillsPage";
import { BillPage } from "./BillPage";
import { AdminPage } from "./AdminPage";

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
