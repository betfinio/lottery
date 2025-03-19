import Countdown from '@/src/components/Countdown.tsx';
import EditTicket from '@/src/components/EditTicket.tsx';
import { useRoundFinish, useWinningLine } from '@/src/lib/query';
import type { ActiveTicketMode, ILine, IRoundTicket } from '@/src/lib/types.ts';
import { compareLines, equals } from '@/src/lib/utils';
import { truncateEthAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { Button, Dialog, DialogContent, DialogTrigger } from '@betfinio/components/ui';
import { Link } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, PencilIcon, PencilLineIcon, SendIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { type FC, useEffect, useState } from 'react';
import { ETHSCAN, LOTTERY_ADDRESS } from '../globals.ts';
import EditMode from './EditMode.tsx';
import TicketStatus from './TicketStatus.tsx';
import SharedLine from './shared/SharedLine.tsx';
import Claim from './status/Claim.tsx';

export interface TicketProps {
	ticket: IRoundTicket;
	mode?: ActiveTicketMode;
	onToggleExpand?: () => void;
	onUpdate?: (ticket: IRoundTicket) => void;
	old?: boolean;
	isExpandable?: boolean;
	className?: string;
	isEditable?: boolean;
}

function Ticket({ ticket, mode = 'compact', onToggleExpand, onUpdate, old = false, isExpandable = true, className, isEditable = true }: TicketProps) {
	const { data: winningLine } = useWinningLine(ticket.round);
	const [lines, setLines] = useState(ticket.lines);
	const [editMode, setEditMode] = useState<number>(-1);

	// Update lines when ticket changes
	useEffect(() => {
		setLines(ticket.lines);
	}, [ticket.lines, winningLine]);

	// Handlers
	const handleFullMode = () => onToggleExpand?.();

	const handleSave = (line: ILine) => {
		setLines(lines.map((l, i) => (i === editMode ? line : l)));
		setEditMode(-1);
	};

	// Update parent when lines change
	useEffect(() => {
		if (onUpdate) {
			onUpdate({ ...ticket, lines });
		}
	}, [lines, ticket, onUpdate]);

	const isExpanded = mode === 'expanded';
	const isMinimal = mode === 'minimal';
	const isHidden = mode === 'hidden';
	const linesCount = lines.length;

	return (
		<AnimatePresence mode="sync">
			<motion.div
				initial={{
					height: 0,
					opacity: 0,
				}}
				animate={{
					opacity: isHidden ? 0 : 1,
					marginTop: isHidden ? -10 : 0, // needed to remove empty space when hidden
					height: editMode !== -1 ? 500 : isHidden ? 0 : isExpanded ? (linesCount + 3) * 40.52 : isMinimal ? 37 * 2 : 121.56,
				}}
				exit={{
					height: 0,
					opacity: 0,
				}}
				className={cn('border border-purple-box rounded-xl flex flex-col overflow-hidden', className, {
					'bg-gradient-to-b from-background to-background via-primary/20 via-60% grid': isExpanded,
					'grid-rows-4': isExpanded && linesCount === 1,
					'grid-rows-5': isExpanded && linesCount === 2,
					'grid-rows-6': isExpanded && linesCount === 3,
					'grid-rows-7': isExpanded && linesCount === 4,
					'grid-rows-8': isExpanded && linesCount === 5,
					'grid-rows-9': isExpanded && linesCount === 6,
					'grid-rows-10': isExpanded && linesCount === 7,
					'grid-rows-11': isExpanded && linesCount === 8,
					'grid-rows-12': isExpanded && linesCount === 9,
					'border-primary create-shadow': ticket.isLocal,
				})}
			>
				<Header ticket={ticket} old={old} hidden={isMinimal} isExpanded={isExpanded} />
				<motion.div
					animate={{ height: isExpanded ? '100%' : isMinimal ? '100%' : '33%' }}
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
					<AnimatePresence mode="sync">
						{lines
							.toSorted((a, b) =>
								winningLine ? (compareLines(b, winningLine, lines.length >= 3) > compareLines(a, winningLine, lines.length >= 3) ? 1 : -1) : 0,
							)
							.slice(0, isExpanded ? lines.length : 1)
							.map((line, index) => (
								<motion.div
									exit={{ height: 0, opacity: 0, scale: 0 }}
									initial={{ height: 0, opacity: 0, scale: 0 }}
									animate={{ height: '100%', opacity: 1, scale: 1 }}
									transition={{
										delay: index * 0.02,
									}}
									onClick={handleFullMode}
									key={index}
									className={'flex flex-row items-center gap-2'}
								>
									<SharedLine
										line={line}
										dynamicNumberClassName={(index) => cn({ 'stroke-success': winningLine && line.numbers[index] === winningLine.numbers[index] })}
										symbolClassName={cn({ 'stroke-success': winningLine && line.symbol === winningLine.symbol })}
									/>
									{!isEditable && (
										<motion.div initial={{ scale: 0 }} animate={{ scale: isEditable ? 0 : 1 }} exit={{ scale: 0 }}>
											<PencilIcon className={'w-4 h-4 cursor-pointer'} onClick={() => setEditMode(index)} />
										</motion.div>
									)}
									<motion.div
										animate={{ rotate: isExpanded ? 180 : 0 }}
										className={cn('cursor-pointer', {
											'opacity-0': index > 0 || lines.length === 1,
											hidden: !isExpandable,
										})}
									>
										<ChevronDown className={'w-6 h-6'} />
									</motion.div>
								</motion.div>
							))}
					</AnimatePresence>
				</motion.div>
				{isExpanded && (
					<div className="flex flex-row items-center justify-center gap-1 text-sm text-muted-foreground row-span-1">
						Round:
						<Link to={'/games/lottery/lotto/$round'} params={{ round: ticket.round }}>
							{truncateEthAddress(ticket.round)}
						</Link>
					</div>
				)}
				{isEditable && (
					<motion.div
						className={'flex flex-row items-center justify-center px-2 gap-2'}
						initial={{ height: 0, opacity: 0 }}
						animate={{
							height: isExpanded ? '100%' : isMinimal ? 0 : '33%',
							opacity: isMinimal ? 0 : 1,
						}}
						exit={{ height: 0, opacity: 0 }}
					>
						{!old && <SendPill ticket={ticket} />}
						{!old && <EditPill ticket={ticket} />}
						{old && <Claim ticket={ticket} />}
					</motion.div>
				)}
			</motion.div>
			{editMode !== -1 && (
				<EditMode
					round={ticket.round}
					shouldValidateAvaliability={true}
					ticket={lines[editMode]}
					onSave={(line) => handleSave(line)}
					onBack={() => setEditMode(-1)}
					order={editMode + 1}
					editMode={editMode !== -1}
				/>
			)}
		</AnimatePresence>
	);
}

const Header: FC<{
	ticket: IRoundTicket;
	old: boolean;
	hidden: boolean;
	isExpanded: boolean;
}> = ({ ticket, old, hidden, isExpanded }) => {
	const { data: finish = 0 } = useRoundFinish(ticket.round);
	return (
		<motion.div
			className={'flex flex-row items-center justify-between px-2 row-start-1'}
			initial={{
				height: 0,
				opacity: 0,
			}}
			animate={{
				height: hidden ? 0 : isExpanded ? '100%' : '33%',
				opacity: hidden ? 0 : 1,
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
		<Button
			size="freeSize"
			shape="pill"
			className={'flex flex-row items-center gap-1 text- cursor-pointer bg-success text-success-foreground py-0 px-2 hover:scale-105 transition-all'}
		>
			<SendIcon className={'w-3 h-3 cursor-pointer'} />
			Send
		</Button>
	);
};
const EditPill: FC<{ ticket: IRoundTicket }> = ({ ticket }) => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					size="freeSize"
					shape="pill"
					className={'flex flex-row items-center gap-1 cursor-pointer bg-primary text-primary-foreground py-0 px-2 hover:scale-105 transition-all'}
				>
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
