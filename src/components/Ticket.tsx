import Countdown from '@/src/components/Countdown.tsx';
import EditMode from '@/src/components/EditMode.tsx';
import EditTicket from '@/src/components/EditTicket.tsx';
import { useRoundFinish, useWinningLine } from '@/src/lib/query';
import type { ActiveTicketMode, ILine, IRoundTicket } from '@/src/lib/types.ts';
import { compareLines, partlyEquals } from '@/src/lib/utils';
import { truncateEthAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { Badge, Button, Dialog, DialogContent, DialogTrigger } from '@betfinio/components/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, PencilLineIcon, SendIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { type FC, useEffect, useState } from 'react';
import { ETHSCAN, LOTTERY_ADDRESS } from '../globals.ts';
import { NumberComponent, SymbolElement } from './Line.tsx';
import TicketStatus from './TicketStatus.tsx';
import SharedLine from './shared/SharedLine.tsx';

export interface TicketProps {
	ticket: IRoundTicket;
	mode?: ActiveTicketMode;
	onToggleExpand?: () => void;
	onUpdate?: (ticket: IRoundTicket) => void;
	old?: boolean;
	isExpandable?: boolean;
	className?: string;
}

function Ticket({ ticket, mode = 'compact', onToggleExpand, onUpdate, old = false, isExpandable = true, className }: TicketProps) {
	const { data: winningLine } = useWinningLine(ticket.round);
	const [editing, setEditing] = useState(-1);
	const [lines, setLines] = useState(ticket.lines);

	// Update lines when ticket changes
	useEffect(() => {
		setLines(ticket.lines);
	}, [ticket.lines, winningLine]);

	// Handlers
	const handleFullMode = () => onToggleExpand?.();

	const changeLine = (line: ILine, index: number) => {
		setLines((prev) => {
			const newLines = [...prev];
			newLines[index] = line;
			return newLines;
		});
	};

	const handleEdit = (line: ILine, index: number) => {
		changeLine(line, index);
		setEditing(-1);
	};

	// Update parent when lines change
	useEffect(() => {
		if (onUpdate) {
			onUpdate({ ...ticket, lines });
		}
	}, [lines, ticket, onUpdate]);

	const isExpanded = mode === 'expanded';
	const isMinimal = mode === 'minimal';
	const isCompact = mode === 'compact';
	const linesCount = lines.length;
	return (
		<AnimatePresence mode="wait">
			<motion.div
				animate={{
					height: isExpanded ? (linesCount + 3) * 40.52 : isMinimal ? 37 * 2 : 121.56,
					gridTemplateRows: isExpanded ? `repeat(${linesCount + 3}, minmax(0, 1fr))` : isMinimal ? 'repeat(1, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
				}}
				className={cn('border border-purple-box rounded-xl', className, {
					'grid grid-rows-3': isCompact,
					'grid grid-rows-1': isMinimal,
					'bg-gradient-to-b from-background to-background via-primary/20 via-60% grid': isExpanded,
					'border-primary create-shadow': ticket.isLocal,
				})}
			>
				{!isMinimal && <Header ticket={ticket} old={old} />}
				<motion.div
					className={cn('flex flex-col items-center justify-center', {
						'row-span-9 grid grid-rows-9': linesCount === 9 && isExpanded,
						'row-span-8 grid grid-rows-8': linesCount === 8 && isExpanded,
						'row-span-7 grid grid-rows-7': linesCount === 7 && isExpanded,
						'row-span-6 grid grid-rows-6': linesCount === 6 && isExpanded,
						'row-span-5 grid grid-rows-5': linesCount === 5 && isExpanded,
						'row-span-4 grid grid-rows-4': linesCount === 4 && isExpanded,
						'row-span-3 grid grid-rows-3': linesCount === 3 && isExpanded,
						'row-span-2 grid grid-rows-2': linesCount === 2 && isExpanded,
					})}
				>
					{lines
						.toSorted((a, b) => (winningLine ? (compareLines(b, winningLine) > compareLines(a, winningLine) ? 1 : -1) : 0))
						.slice(0, isExpanded ? lines.length : 1)
						.map((line, index) => (
							<div key={index} className={'flex flex-row items-center gap-2'}>
								<SharedLine line={line} />
								<motion.div
									animate={{ rotate: isExpanded ? 180 : 0 }}
									className={cn('cursor-pointer', {
										'opacity-0': index > 0 || lines.length === 1,
										hidden: !isExpandable,
									})}
									onClick={handleFullMode}
								>
									<ChevronDown className={'w-6 h-6'} />
								</motion.div>
							</div>
						))}
				</motion.div>
				{isExpanded && (
					<div className="flex flex-row items-center justify-center gap-1 text-sm text-muted-foreground row-span-1">
						Round:
						<a href={`${ETHSCAN}/address/${ticket.round}`} target="_blank" rel="noreferrer">
							{truncateEthAddress(ticket.round)}
						</a>
					</div>
				)}
				<motion.div className={'flex flex-row items-center justify-center px-2 gap-2'} animate={{ height: isMinimal ? 0 : 'auto', opacity: isMinimal ? 0 : 1 }}>
					{!old && <SendPill ticket={ticket} />}
					{!old && <EditPill ticket={ticket} />}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

const Header: FC<{ ticket: IRoundTicket; old: boolean }> = ({ ticket, old }) => {
	const { data: finish = 0 } = useRoundFinish(ticket.round);
	return (
		<motion.div
			className={'flex flex-row items-center justify-between px-2'}
			initial={{
				height: 0,
				opacity: 0,
			}}
			animate={{
				height: 'auto',
				opacity: 1,
			}}
			exit={{
				height: 0,
				opacity: 0,
			}}
		>
			<div className={'flex flex-row items-center gap-2 whitespace-nowrap'}>
				<a href={`${ETHSCAN}/nft/${LOTTERY_ADDRESS}/${ticket.token}`} target="_blank" rel="noreferrer">
					#{ticket.token}
				</a>
				<div className={'text text-muted-foreground'}>{ticket.lines.length} lines</div>
				{old && <div className={'text-muted-foreground/50'}>{DateTime.fromSeconds(finish).toFormat('dd/MM T')}</div>}
			</div>
			{old ? <TicketStatus ticket={ticket} /> : <Countdown size={26} finish={finish} className={cn('text-muted-foreground text-xs')} />}
		</motion.div>
	);
};

const SendPill: FC<{ ticket: IRoundTicket }> = ({ ticket }) => {
	return (
		<Button size="freeSize" shape="pill" className={'flex flex-row items-center gap-1 text- cursor-pointer bg-success text-success-foreground py-0 px-2'}>
			<SendIcon className={'w-3 h-3 cursor-pointer'} />
			Send
		</Button>
	);
};
const EditPill: FC<{ ticket: IRoundTicket }> = ({ ticket }) => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="freeSize" shape="pill" className={'flex flex-row items-center gap-1 cursor-pointer bg-primary text-primary-foreground py-0 px-2'}>
					<PencilLineIcon className={'w-3 h-3 cursor-pointer'} />
					Edit
				</Button>
			</DialogTrigger>
			<DialogContent className={'lottery'}>
				<EditTicket ticket={ticket} onClose={() => {}} />
			</DialogContent>
		</Dialog>
	);
};

export default Ticket;
