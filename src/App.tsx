import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Create from './pages/Create';
import View from './pages/View';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'create',
        element: <Create />,
      },
      {
        path: 'view',
        element: <View />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;