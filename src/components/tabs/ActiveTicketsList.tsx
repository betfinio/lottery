import { LoaderIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import TicketsList from '@/src/components/tabs/TicketsList.tsx';
import { useActiveTickets } from '@/src/lib/query';

function ActiveTicketsList() {
	const { t } = useTranslation('lottery');
	const { address } = useAccount();
	const { data: tickets = [], isLoading } = useActiveTickets(address);
	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-full">
				<LoaderIcon className="w-10 h-10 animate-spin" />
			</div>
		);
	}
	if (tickets.length === 0) {
		return (
			<div className={'flex flex-col items-center justify-center h-full'}>
				<div className={'flex flex-col items-center justify-center gap-2'}>{t('noTicketsYet')}</div>
			</div>
		);
	}
	return <TicketsList tickets={tickets} />;
}

export default ActiveTicketsList;
