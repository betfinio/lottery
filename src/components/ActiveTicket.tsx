import Countdown from '@/src/components/Countdown.tsx';
import { useRoundFinish } from '@/src/lib/query';
import type { ActiveTicketMode, IRoundTicket } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, PencilLineIcon } from 'lucide-react';
import logger from '../config/logger';
import { NumberComponent, SymbolElement } from './Ticket';

export interface ActiveTicketProps {
	ticket: IRoundTicket;
	mode?: ActiveTicketMode;
	onToggleExpand: () => void;
}

function ActiveTicket({ ticket, mode = 'compact', onToggleExpand }: ActiveTicketProps) {
	const { data: finish = 0 } = useRoundFinish(ticket.round);

	const handleOpenEditMode = () => {
		logger.log('edit');
	};
	const handleFullMode = () => {
		onToggleExpand();
	};
	return (
		<div className={cn('border border-purple-box rounded-xl p-2 bg-background-light/50 ')}>
			<motion.div
				animate={{ height: mode === 'minimal' ? 0 : 'auto', opacity: mode === 'minimal' ? 0 : 1 }}
				className={'flex flex-row items-center justify-between'}
			>
				<div className={'flex flex-row items-center gap-2'}>
					#{ticket.token}
					<PencilLineIcon className={'w-4 h-4 text-muted-foreground cursor-pointer'} onClick={handleOpenEditMode} />
				</div>
				<Countdown size={30} finish={finish} className={'text-muted-foreground'} />
			</motion.div>
			<motion.div className={'flex flex-col relative py-2'}>
				{ticket.tickets.length > 1 && (
					<motion.div animate={{ rotate: mode === 'full' ? 180 : 0 }} className={'absolute right-4 top-4 cursor-pointer'} onClick={handleFullMode}>
						<ChevronDown className={'w-6 h-6'} />
					</motion.div>
				)}
				<div className={'max-h-[115px] overflow-y-scroll'}>
					<AnimatePresence>
						{ticket.tickets.slice(0, mode === 'full' ? ticket.tickets.length : 1).map((line, index) => (
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
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</motion.div>
		</div>
	);
}

export default ActiveTicket;
