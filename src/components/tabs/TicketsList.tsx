import { useState } from 'react';
import Pagination from '@/src/components/shared/Pagination';
import Ticket from '@/src/components/Ticket.tsx';
import type { IBet } from '@/src/lib/types.ts';

export interface TicketsListProps {
	tickets: IBet[];
	old?: boolean;
	itemsPerPage?: number;
}

// Mapping of expanded ticket line count to number of tickets to hide
const ticketsToHide = {
	2: 0,
	3: 0,
	4: 1,
	5: 1,
	6: 2,
	7: 2,
	8: 3,
	9: 3,
};

function TicketsList({ tickets = [], old = false, itemsPerPage = 4 }: TicketsListProps) {
	const [expanded, setExpanded] = useState<IBet | null>(null);

	const handleToggleExpand = (ticket: IBet) => {
		setExpanded(expanded?.betAddress === ticket.betAddress ? null : ticket);
	};

	const renderItem = (ticket: IBet, index: number, ticketsInPage: IBet[]) => {
		// Default compact view when nothing is expanded
		if (expanded === null) {
			return <Ticket old={old} ticket={ticket} key={ticket.betAddress} mode="compact" onToggleExpand={() => handleToggleExpand(ticket)} />;
		}

		// Expanded ticket view
		if (expanded.betAddress === ticket.betAddress) {
			return <Ticket old={old} ticket={ticket} key={ticket.betAddress} mode="expanded" onToggleExpand={() => handleToggleExpand(ticket)} />;
		}

		// Minimal view for non-expanded tickets
		const expandedLength = expanded.tickets.length;
		const otherTickets = ticketsInPage.filter((t) => t.betAddress !== expanded.betAddress);

		// Special handling for 2-3 lines
		if (expandedLength <= 3) {
			return <Ticket old={old} ticket={ticket} key={ticket.betAddress} mode="minimal" onToggleExpand={() => handleToggleExpand(ticket)} />;
		}

		// Hide some tickets based on expanded ticket size
		const hide = ticketsToHide[expandedLength as keyof typeof ticketsToHide] || 0;
		if (otherTickets.slice(0, hide).find((t) => t.betAddress === ticket.betAddress)) {
			return <Ticket old={old} ticket={ticket} key={ticket.betAddress} mode="hidden" onToggleExpand={() => handleToggleExpand(ticket)} />;
		}

		return <Ticket old={old} ticket={ticket} key={ticket.betAddress} mode="minimal" onToggleExpand={() => handleToggleExpand(ticket)} />;
	};

	return (
		<Pagination
			items={tickets}
			itemsPerPage={itemsPerPage}
			onPageChange={() => setExpanded(null)}
			additionalFooter={
				<div className="text-sm text-muted-foreground px-2">
					Total: <span className="text-foreground">{tickets.length}</span>
				</div>
			}
			renderItem={renderItem}
			className="flex flex-col gap-2 w-full"
		/>
	);
}

export default TicketsList;
