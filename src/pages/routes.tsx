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
import SponsorPage from './extra-pages/SponsorPage';
import SponsorsPage from './extra-pages/SponsorsPage';

const routes = [
  {
    path: "/",
    element: <MainLayout />,
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
        path: "sponsors",
        element: <SponsorsPage />,
      },
      {
        path: "sponsor",
        element: <SponsorPage />,
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
