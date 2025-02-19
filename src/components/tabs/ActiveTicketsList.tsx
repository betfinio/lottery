import TicketsList from '@/src/components/tabs/TicketsList.tsx';
import { useActiveTickets } from '@/src/lib/query';
import { LoaderIcon } from 'lucide-react';
import { useAccount } from 'wagmi';

function ActiveTicketsList() {
	const { address } = useAccount();
	const { data: tickets = [], isLoading } = useActiveTickets(address);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-full">
				<LoaderIcon className="w-10 h-10 animate-spin" />
			</div>
		);
	}
	return <TicketsList tickets={tickets} />;
}

export default ActiveTicketsList;
