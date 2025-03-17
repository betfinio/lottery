import TicketsList from '@/src/components/tabs/TicketsList.tsx';
import { useOldTickets } from '@/src/lib/query';
import { useAccount } from 'wagmi';

function OldTicketsList() {
	const { address } = useAccount();
	const { data: tickets = [] } = useOldTickets(address);
	if (tickets.length === 0) {
		return (
			<div className={'flex flex-col items-center justify-center h-full'}>
				<div className={'flex flex-col items-center justify-center gap-2'}>No tickets yet</div>
			</div>
		);
	}
	return <TicketsList tickets={tickets} old={true} />;
}

export default OldTicketsList;
