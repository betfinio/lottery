import Ticket from '@/src/components/Ticket.tsx';
import Pagination from '@/src/components/shared/Pagination';
import type { ActiveTicketMode, IRoundTicket } from '@/src/lib/types.ts';
import { useState } from 'react';

export interface TicketsListProps {
	tickets: IRoundTicket[];
	old?: boolean;
	itemsPerPage?: number;
}

function TicketsList({ tickets = [], old = false, itemsPerPage = 4 }: TicketsListProps) {
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
			itemsPerPage={itemsPerPage}
			className="w-full h-full"
			additionalFooter={
				<div className="text-sm text-muted-foreground">
					Total: <span className="text-foreground">{tickets.length}</span>
				</div>
			}
			renderItem={(ticket, index) => <Ticket old={old} ticket={ticket} key={index} mode={getMode(index)} onToggleExpand={() => handleToggleExpand(index)} />}
		/>
	);
}

export default TicketsList;
