import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import TicketsList from '@/src/components/tabs/TicketsList.tsx';
import { usePlayerBets } from '@/src/lib/query';

function OldTicketsList() {
	const { t } = useTranslation('lottery');
	const { address } = useAccount();
	const { data: allBets = [] } = usePlayerBets(address);
	// Filter to only resolved/refunded bets
	const tickets = useMemo(() => allBets.filter((bet) => bet.status !== 'pending'), [allBets]);
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
