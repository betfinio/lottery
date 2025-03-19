import Ticket from '@/src/components/Ticket.tsx';
import Pagination from '@/src/components/shared/Pagination';
import type { ActiveTicketMode, IRoundTicket } from '@/src/lib/types.ts';
import { useState } from 'react';

export interface TicketsListProps {
	tickets: IRoundTicket[];
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

// Row span mapping based on line count
const rowSpanMap = {
	2: 'row-span-5',
	3: 'row-span-6',
	4: 'row-span-7',
	5: 'row-span-8',
	6: 'row-span-9',
	7: 'row-span-10',
	8: 'row-span-11',
	9: 'row-span-12',
};

function TicketsList({ tickets = [], old = false, itemsPerPage = 4 }: TicketsListProps) {
	const [expanded, setExpanded] = useState<IRoundTicket | null>(null);

	const handleToggleExpand = (ticket: IRoundTicket) => {
		setExpanded(expanded?.token === ticket.token ? null : ticket);
	};

	const renderItem = (ticket: IRoundTicket, index: number, ticketsInPage: IRoundTicket[]) => {
		// Default compact view when nothing is expanded
		if (expanded === null) {
			return <Ticket old={old} ticket={ticket} key={index} mode="compact" onToggleExpand={() => handleToggleExpand(ticket)} />;
		}

		// Expanded ticket view
		if (expanded.token === ticket.token) {
			const lineCount = ticket.lines.length as keyof typeof rowSpanMap;
			return <Ticket old={old} ticket={ticket} key={index} mode="expanded" onToggleExpand={() => handleToggleExpand(ticket)} />;
		}

		// Minimal view for non-expanded tickets
		const expandedLength = expanded.lines.length;
		const otherTickets = ticketsInPage.filter((t) => t.token !== expanded.token);

		// Special handling for 2-3 lines
		if (expandedLength <= 3) {
			return <Ticket old={old} ticket={ticket} key={index} mode="minimal" onToggleExpand={() => handleToggleExpand(ticket)} />;
		}

		// Hide some tickets based on expanded ticket size
		const hide = ticketsToHide[expandedLength as keyof typeof ticketsToHide] || 0;
		if (otherTickets.slice(0, hide).find((t) => t.token === ticket.token)) {
			return <Ticket old={old} ticket={ticket} key={index} mode="hidden" onToggleExpand={() => handleToggleExpand(ticket)} />;
		}

		return <Ticket old={old} ticket={ticket} key={index} mode="minimal" onToggleExpand={() => handleToggleExpand(ticket)} />;
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
			className="flex flex-col gap-2"
		/>
	);
}

export default TicketsList;
