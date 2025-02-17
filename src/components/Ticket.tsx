import Countdown from '@/src/components/Countdown.tsx';
import EditMode from '@/src/components/EditMode.tsx';
import EditTicket from '@/src/components/EditTicket.tsx';
import { useRoundFinish, useWinningLine } from '@/src/lib/query';
import type { ActiveTicketMode, ILine, IRoundTicket } from '@/src/lib/types.ts';
import { compareLines, equals, partlyEquals, randomize } from '@/src/lib/utils';
import { truncateEthAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { Badge, Dialog, DialogContent, DialogTrigger } from '@betfinio/components/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, PencilLineIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import logger from '../config/logger';
import { ETHSCAN, LOTTERY_ADDRESS } from '../globals.ts';
import { NumberComponent, SymbolElement } from './Line.tsx';
import TicketStatus from './TicketStatus.tsx';

export interface TicketProps {
	ticket: IRoundTicket;
	mode?: ActiveTicketMode;
	onToggleExpand?: () => void;
	onUpdate?: (ticket: IRoundTicket) => void;
	old?: boolean;
}

function Ticket({ ticket, mode = 'compact', onToggleExpand, onUpdate, old = false }: TicketProps) {
	const { data: finish = 0 } = useRoundFinish(ticket.round);
	const { data: winningLine } = useWinningLine(ticket.round);
	const [editing, setEditing] = useState(-1);
	const [open, setOpen] = useState(false);
	const [lines, setLines] = useState(ticket.lines);

	// Update lines when ticket changes
	useEffect(() => {
		setLines(ticket.lines);
	}, [ticket.lines, winningLine]);

	// Handlers
	const handleOpenEditMode = () => logger.log('edit');
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

	const handleClose = () => {
		setEditing(-1);
		setOpen(false);
	};

	// Update parent when lines change
	useEffect(() => {
		if (onUpdate) {
			onUpdate({ ...ticket, lines });
		}
	}, [lines, ticket, onUpdate]);
	return (
		<motion.div
			animate={{ height: editing === -1 ? 'auto' : 450 }}
			className={cn('border border-purple-box rounded-xl p-2', {
				'bg-gradient-to-b from-background to-background via-primary/20 via-60%': mode === 'full' || mode === 'expanded',
				'border-primary shadow': ticket.isLocal,
			})}
		>
			<Dialog open={open} onOpenChange={setOpen}>
				<motion.div
					animate={{
						height: mode === 'minimal' ? 0 : 'auto',
						opacity: mode === 'minimal' ? 0 : 1,
					}}
					className={'flex flex-row items-center justify-between'}
				>
					<div className={'flex flex-row items-center gap-2'}>
						<a href={`${ETHSCAN}/nft/${LOTTERY_ADDRESS}/${ticket.token}`} target="_blank" rel="noreferrer">
							#{ticket.token}
						</a>
						{mode !== 'expanded' && !old && (
							<DialogTrigger>
								<PencilLineIcon className={'w-4 h-4 text-secondary-foreground cursor-pointer'} onClick={handleOpenEditMode} />
							</DialogTrigger>
						)}
						<div className={'text text-muted-foreground'}>{lines.length} lines</div>
					</div>
					{old ? <TicketStatus ticket={ticket} /> : <Countdown size={30} finish={finish} className={cn('text-muted-foreground')} />}
				</motion.div>
				<motion.div className={'flex flex-col py-2'}>
					<div
						className={cn('overflow-y-scroll', {
							'max-h-[115px]': mode !== 'expanded',
						})}
					>
						{(mode === 'full' || mode === 'expanded') && (
							<div className="flex flex-row items-center justify-center gap-1 text-sm text-muted-foreground">
								Round:
								<a href={`${ETHSCAN}/${ticket.round}`} target="_blank" rel="noreferrer">
									{truncateEthAddress(ticket.round)}
								</a>
							</div>
						)}
						<AnimatePresence>
							{lines
								.toSorted((a, b) => (winningLine ? (compareLines(b, winningLine) > compareLines(a, winningLine) ? 1 : -1) : 0))
								.slice(0, mode === 'full' || mode === 'expanded' ? lines.length : 1)
								.map((line, index) => (
									<motion.div
										initial={{ opacity: 0, height: 0, margin: 0 }}
										key={index}
										animate={{ opacity: 1, height: 33, margin: 4 }}
										exit={{ height: 0, opacity: 0, margin: 0 }}
										className={cn('flex flex-row gap-2 items-center justify-center')}
									>
										{line.numbers
											.sort((a, b) => a - b)
											.map((number, i) => (
												<NumberComponent
													key={i}
													className={cn({
														'stroke-success': winningLine && partlyEquals(line, winningLine, i),
													})}
												>
													{number || '-'}
												</NumberComponent>
											))}
										+
										<NumberComponent
											isSymbol
											className={cn({
												'stroke-success': winningLine && line.symbol === winningLine.symbol,
											})}
										>
											<SymbolElement symbol={line.symbol} />
										</NumberComponent>
										<div onClick={() => setEditing(index)} className={cn({ hidden: mode !== 'expanded' }, 'cursor-pointer')}>
											<PencilLineIcon className={'w-4 h-4 text-secondary-foreground'} />
										</div>
										<motion.div
											animate={{ rotate: mode === 'full' ? 180 : 0 }}
											className={cn('cursor-pointer', {
												'opacity-0': index > 0 || lines.length === 1,
											})}
											onClick={handleFullMode}
										>
											<ChevronDown className={'w-6 h-6'} />
										</motion.div>
										<EditMode ticket={line} editMode={editing === index} onSave={(e) => handleEdit(e, index)} onBack={() => setEditing(-1)} order={index} />
									</motion.div>
								))}
						</AnimatePresence>
					</div>
				</motion.div>
				<DialogContent className={'lottery'}>
					<EditTicket ticket={ticket} onClose={handleClose} />
				</DialogContent>
			</Dialog>
		</motion.div>
	);
}

export default Ticket;
