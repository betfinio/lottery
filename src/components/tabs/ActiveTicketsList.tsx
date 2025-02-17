import TicketsList from '@/src/components/tabs/TicketsList.tsx';
import { useActiveTickets } from '@/src/lib/query';
import { useAccount } from 'wagmi';

function ActiveTicketsList() {
	const { address } = useAccount();
	const { data: tickets = [] } = useActiveTickets(address);

	return <TicketsList tickets={tickets} />;
}

export default ActiveTicketsList;
