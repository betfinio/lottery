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
	};

	const handlePrev = () => {
		if (offset === 0) return;
		setOffset((prev) => prev - 4);
	};

	return (
		<div className={'flex flex-col justify-between gap-2'}>
			{tickets.slice(offset, offset + 4).map((ticket, index) => (
				<Ticket old={old} ticket={ticket} key={index + offset} mode={getMode(index + offset)} onToggleExpand={() => handleToggleExpand(index + offset)} />
			))}
			<div className={'flex absolute w-full bottom-0 left-0 p-2 flex-row justify-between py-2 items-center h-10'} key={'navigation'}>
				<ChevronLeft className={cn('w-5 h-5 cursor-pointer', offset === 0 && 'text-muted-foreground')} onClick={handlePrev} />
				<div className={'flex flex-row gap-1'}>
					{Array.from({ length: Math.ceil(tickets.length / 4) }).map((_, i) => (
						<div
							key={i}
							className={cn(
								'rounded-md w-6 h-6 flex items-center justify-center text-sm ',
								i === Math.floor(offset / 4) ? 'text-foreground' : 'text-muted-foreground',
							)}
						>
							{i + 1}
						</div>
					))}
				</div>
				<ChevronRight className={cn('w-5 h-5 cursor-pointer', offset + 4 >= tickets.length && 'text-muted-foreground')} onClick={handleNext} />
			</div>
		</div>
	);
}

export default TicketsList;
