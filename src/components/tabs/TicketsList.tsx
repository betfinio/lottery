import Ticket from '@/src/components/Ticket.tsx';
import type { ActiveTicketMode, IRoundTicket } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export interface TicketsListProps {
	tickets: IRoundTicket[];
	old?: boolean;
}

function TicketsList({ tickets = [], old = false }: TicketsListProps) {
	const [expanded, setExpanded] = useState<number>(-1);
	const [offset, setOffset] = useState(0);

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

	const handleNext = () => {
		if (offset + 4 >= tickets.length) return;
		setOffset((prev) => prev + 4);
		setExpanded(-1);
	};

	const handlePrev = () => {
		if (offset === 0) return;
		setOffset((prev) => prev - 4);
		setExpanded(-1);
	};

	const renderPagination = () => {
		const totalPages = Math.ceil(tickets.length / 4);
		if (totalPages === 0) return null;

		const currentPage = Math.floor(offset / 4);

		// Show max 5 pages with current page in middle when possible
		const pages: number[] = [];
		if (totalPages <= 5) {
			// Show all pages if 5 or fewer
			pages.push(...Array.from({ length: totalPages }, (_, i) => i));
		} else {
			// Always show first page
			pages.push(0);

			let start = Math.max(1, currentPage - 1);
			let end = Math.min(totalPages - 2, currentPage + 1);

			if (currentPage <= 2) {
				end = 3;
			}
			if (currentPage >= totalPages - 3) {
				start = totalPages - 4;
			}

			if (start > 1) {
				pages.push(-1); // Add ellipsis
			}

			for (let i = start; i <= end; i++) {
				pages.push(i);
			}

			if (end < totalPages - 2) {
				pages.push(-1); // Add ellipsis
			}

			// Always show last page
			pages.push(totalPages - 1);
		}

		return pages.map((pageNum, idx) =>
			pageNum === -1 ? (
				<div key={`ellipsis-${idx}`} className="px-1">
					...
				</div>
			) : (
				<div
					key={`page-${pageNum}`}
					onClick={() => {
						setOffset(pageNum * 4);
						setExpanded(-1);
					}}
					className={cn('flex items-center justify-center px-1 ', {
						'text-secondary-foreground': currentPage === pageNum,
						'text-foreground': currentPage !== pageNum,
					})}
				>
					{pageNum + 1}
				</div>
			),
		);
	};
	return (
		<div className={'flex flex-col justify-between gap-2 w-full h-full'}>
			{tickets.slice(offset, offset + 4).map((ticket, index) => (
				<Ticket old={old} ticket={ticket} key={index + offset} mode={getMode(index + offset)} onToggleExpand={() => handleToggleExpand(index + offset)} />
			))}
			<div className={'flex absolute w-full bottom-0 left-0 p-2 flex-row justify-between py-2 items-center h-10'} key={'navigation'}>
				<ChevronLeft className={cn('w-5 h-5 cursor-pointer', offset === 0 && 'text-muted-foreground')} onClick={handlePrev} />
				<div className={'flex flex-row gap-1'}>{renderPagination()}</div>
				<ChevronRight className={cn('w-5 h-5 cursor-pointer', offset + 4 >= tickets.length && 'text-muted-foreground')} onClick={handleNext} />
			</div>
		</div>
	);
}

export default TicketsList;
