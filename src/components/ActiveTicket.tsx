import Countdown from '@/src/components/Countdown.tsx';
import EditMode from '@/src/components/EditMode.tsx';
import EditTicket from '@/src/components/EditTicket.tsx';
import { useRoundFinish } from '@/src/lib/query';
import type { ActiveTicketMode, IRoundTicket, ITicket } from '@/src/lib/types.ts';
import { randomize } from '@/src/lib/utils';
import { cn } from '@betfinio/components';
import { Dialog, DialogContent, DialogTrigger } from '@betfinio/components/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, PencilLineIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import logger from '../config/logger';
import { NumberComponent, SymbolElement } from './Ticket';

export interface ActiveTicketProps {
	ticket: IRoundTicket;
	mode?: ActiveTicketMode;
	onToggleExpand?: () => void;
	onUpdate?: (ticket: IRoundTicket) => void;
}

function ActiveTicket({ ticket, mode = 'compact', onToggleExpand, onUpdate }: ActiveTicketProps) {
	const { data: finish = 0 } = useRoundFinish(ticket.round);
	const [editing, setEditing] = useState(-1);
	const [open, setOpen] = useState(false);
	const [lines, setLines] = useState(ticket.tickets);
	useEffect(() => {
		setLines(ticket.tickets);
	}, [ticket.tickets]);
	const handleOpenEditMode = () => {
		logger.log('edit');
	};
	const handleFullMode = () => {
		onToggleExpand?.();
	};
	const handleRandomize = (index: number) => {
		logger.log('randomize', index);
		const random = randomize();
		changeLine(random, index);
	};
	const changeLine = (line: ITicket, index: number) => {
		const newLines = [...lines];
		newLines[index] = line;
		setLines(newLines);
	};
	const handleEdit = (line: ITicket, index: number) => {
		changeLine(line, index);
		setEditing(-1);
	};
	const handleClose = () => {
		setEditing(-1);
		setOpen(false);
	};
	useEffect(() => {
		onUpdate?.({ ...ticket, tickets: lines });
	}, [lines, ticket.tickets]);
	return (
		<motion.div animate={{ height: editing === -1 ? 'auto' : 450 }} className={cn('border border-purple-box rounded-xl p-2 bg-background-light/50')}>
			<Dialog open={open} onOpenChange={setOpen}>
				<motion.div
					animate={{ height: mode === 'minimal' ? 0 : 'auto', opacity: mode === 'minimal' ? 0 : 1 }}
					className={'flex flex-row items-center justify-between'}
				>
					<div className={'flex flex-row items-center gap-2'}>
						#{ticket.token}
						{mode !== 'expanded' && (
							<DialogTrigger>
								<PencilLineIcon className={'w-4 h-4 text-muted-foreground cursor-pointer'} onClick={handleOpenEditMode} />
							</DialogTrigger>
						)}
						<div className={'text text-muted-foreground'}>{lines.length} lines</div>
					</div>
					<Countdown size={30} finish={finish} className={'text-muted-foreground'} />
				</motion.div>
				<motion.div className={'flex flex-col py-2'}>
					{lines.length > 1 && mode !== 'expanded' && (
						<motion.div animate={{ rotate: mode === 'full' ? 180 : 0 }} className={'absolute right-4 top-4 cursor-pointer'} onClick={handleFullMode}>
							<ChevronDown className={'w-6 h-6'} />
						</motion.div>
					)}
					<div className={cn('overflow-y-scroll', { 'max-h-[115px]': mode !== 'expanded' })}>
						<AnimatePresence>
							{lines.slice(0, mode === 'full' || mode === 'expanded' ? lines.length : 1).map((line, index) => (
								<motion.div
									initial={{ opacity: 0, height: 0, margin: 0 }}
									key={index}
									animate={{ opacity: 1, height: 33, margin: 4 }}
									exit={{ height: 0, opacity: 0, margin: 0 }}
									className={'flex flex-row gap-2 items-center justify-center'}
								>
									{line.numbers
										.sort((a, b) => a - b)
										.map((number, index) => (
											<NumberComponent key={index}>{number || '-'}</NumberComponent>
										))}
									+
									<NumberComponent isSymbol>
										<SymbolElement symbol={line.symbol} />
									</NumberComponent>
									<div onClick={() => setEditing(index)} className={cn({ hidden: mode !== 'expanded' }, 'cursor-pointer')}>
										<PencilLineIcon className={'w-4 h-4'} />
									</div>
									<EditMode
										ticket={line}
										editMode={editing === index}
										onSave={(e) => handleEdit(e, index)}
										onBack={() => setEditing(-1)}
										order={index}
										onRandomize={() => handleRandomize(index)}
									/>
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

export default ActiveTicket;
