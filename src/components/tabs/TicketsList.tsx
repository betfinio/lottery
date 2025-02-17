import Ticket from '@/src/components/Ticket.tsx';
import Pagination from '@/src/components/shared/Pagination';
import type { ActiveTicketMode, IRoundTicket } from '@/src/lib/types.ts';
import { useState } from 'react';

export interface TicketsListProps {
	tickets: IRoundTicket[];
	old?: boolean;
}

function TicketsList({ tickets = [], old = false }: TicketsListProps) {
	const [expanded, setExpanded] = useState<number>(-1);

	const getMode = (index: number): ActiveTicketMode => {
		if (expanded === -1) return 'compact';
		if (expanded === index) return 'full';
		return 'minimal';
	};

	const handleToggleExpand = (index: number) => {
		if (index === expanded) {
			setExpanded(-1);
		} else {
			setExpanded(index);
		}
	};

	return (
		<Pagination
			items={tickets}
			itemsPerPage={4}
			className="w-full h-full"
			renderItem={(ticket, index) => <Ticket old={old} ticket={ticket} key={index} mode={getMode(index)} onToggleExpand={() => handleToggleExpand(index)} />}
		/>
	);
}

export default TicketsList;
