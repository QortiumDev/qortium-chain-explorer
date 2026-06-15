import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { HomePage } from '../pages/HomePage';
import { BlocksPage } from '../pages/BlocksPage';
import { BlockPage } from '../pages/BlockPage';
import { TxPage } from '../pages/TxPage';
import { AddressPage } from '../pages/AddressPage';
import { PaymentsPage } from '../pages/PaymentsPage';
import { useIframe } from '../hooks/useIframeListener';

const _startRoute = new URLSearchParams(window.location.search).get('_route');
if (_startRoute) window.location.hash = _startRoute;

function Layout() {
  useIframe();

  return (
    <>
      <TopBar />
      <Outlet />
    </>
  );
}

const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,              element: <HomePage /> },
      { path: 'blocks',          element: <BlocksPage /> },
      { path: 'block/:height',   element: <BlockPage /> },
      { path: 'tx/:signature',   element: <TxPage /> },
      { path: 'address/:address', element: <AddressPage /> },
      { path: 'payments',         element: <PaymentsPage /> },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
