import CreateTicket from '@/src/components/CreateTicket.tsx';
import DrawInfo from '@/src/components/DrawInfo.tsx';
import PlaceBet from '@/src/components/PlaceBet.tsx';
import Header from '@/src/components/shared/Header.tsx';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/lottery/lotto/$round')({
	component: LottoPage,
});

function LottoPage() {
	return (
		<div className={'p-2 md:p-3 lg:p-4 flex flex-col items-center gap-2 md:gap-3 lg:gap-4'}>
			<Header />
			<div className={'grid grid-cols-3 gap-2 md:gap-3 lg:gap-4 w-full'}>
				<CreateTicket />
				<PlaceBet />
				<DrawInfo />
			</div>
		</div>
	);
}
