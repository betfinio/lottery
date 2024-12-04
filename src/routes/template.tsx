import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/template')({
	component: RouteComponent,
});

function RouteComponent() {
	return 'Hello /template!';
}
