import '@/src/globals.css';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import { routeTree } from './routeTree.gen';

export const router = createRouter({ routeTree, scrollRestoration: true });

const rootElement = document.getElementById('root');
if (rootElement) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
