import ActiveTicket from '@/src/components/ActiveTicket.tsx';
import { useActiveTicket } from '@/src/lib/query';
import type { ActiveTicketMode } from '@/src/lib/types.ts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { cn } from '../../../../components';

function ActiveTicketsList() {
	const { address } = useAccount();
	const { data: tickets = [] } = useActiveTicket(address);
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
				<ActiveTicket ticket={ticket} key={index + offset} mode={getMode(index + offset)} onToggleExpand={() => handleToggleExpand(index + offset)} />
			))}
			<div className={'flex absolute w-full bottom-2 left-0 p-2 flex-row justify-between py-2 items-center h-10'} key={'navigation'}>
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

export default ActiveTicketsList;
