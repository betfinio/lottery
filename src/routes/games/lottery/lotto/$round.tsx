import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/games/lottery/lotto/$round')({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/games/lottery/lotto/$round"!</div>;
}
