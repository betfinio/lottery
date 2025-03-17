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
	if (tickets.length === 0) {
		return (
			<div className={'flex flex-col items-center justify-center h-full'}>
				<div className={'flex flex-col items-center justify-center gap-2'}>No tickets yet</div>
			</div>
		);
	}
	return <TicketsList tickets={tickets} />;
}

export default ActiveTicketsList;
