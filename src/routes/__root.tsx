import instance from '@/src/i18n.ts';
import { createRootRoute } from '@tanstack/react-router';
import { Root } from 'betfinio_app/root';
import 'betfinio_app/style';
import { Toaster } from '@betfinio/components/ui';

export const Route = createRootRoute({
	component: () => (
		<Root id={'lottery'} instance={instance}>
			<Toaster />
		</Root>
	),
});
