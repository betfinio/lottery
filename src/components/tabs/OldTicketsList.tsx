import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import TicketsList from '@/src/components/tabs/TicketsList.tsx';
import { useOldTickets } from '@/src/lib/query';

function OldTicketsList() {
	const { t } = useTranslation('lottery');
	const { address } = useAccount();
	const { data: tickets = [] } = useOldTickets(address);
	if (tickets.length === 0) {
		return (
			<div className={'flex flex-col items-center justify-center h-full'}>
				<div className={'flex flex-col items-center justify-center gap-2'}>{t('noTicketsYet')}</div>
			</div>
		);
	}
	return <TicketsList tickets={tickets} old={true} />;
}

export default OldTicketsList;
