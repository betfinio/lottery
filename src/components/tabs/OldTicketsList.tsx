import TicketsList from '@/src/components/tabs/TicketsList.tsx';
import { useOldTickets } from '@/src/lib/query';
import { useAccount } from 'wagmi';

function OldTicketsList() {
	const { address } = useAccount();
	const { data: tickets = [] } = useOldTickets(address);
	console.log('old tickets', tickets);
	return <TicketsList tickets={tickets} old={true} />;
}

export default OldTicketsList;
