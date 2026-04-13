import { cn } from '@betfinio/components';
import { Link } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { DateTime } from 'luxon';
import { AnimatePresence, motion } from 'motion/react';
import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Countdown from '@/src/components/Countdown.tsx';
import { getRoundTimes, useInterval, useRoundOffset, useWinningLine } from '@/src/lib/query';
import type { ActiveTicketMode, IBet } from '@/src/lib/types.ts';
import { compareTickets } from '@/src/lib/utils';
import SharedLine from './shared/SharedLine.tsx';
import Claim from './status/Claim.tsx';
import TicketStatus from './TicketStatus.tsx';

export interface TicketProps {
	ticket: IBet;
	mode?: ActiveTicketMode;
	onToggleExpand?: () => void;
	old?: boolean;
	isExpandable?: boolean;
	className?: string;
}

function Ticket({ ticket, mode = 'compact', onToggleExpand, old = false, isExpandable = true, className }: TicketProps) {
	const { data: winningLine } = useWinningLine(ticket.roundId);
	const [tickets, setTickets] = useState(ticket.tickets);

	const showWinningNumbers = !!winningLine;
	const isLost = winningLine && ticket.tickets.every((t) => compareTickets(t, winningLine) === 0);
	const isWon = winningLine && ticket.tickets.some((t) => compareTickets(t, winningLine) > 0);

	// Update tickets when bet changes
	useEffect(() => {
		setTickets(ticket.tickets);
	}, [ticket.tickets, winningLine]);

	// Handlers
	const handleFullMode = () => onToggleExpand?.();

	const isExpanded = mode === 'expanded';
	const isMinimal = mode === 'minimal';
	const isHidden = mode === 'hidden';
	const ticketsCount = tickets.length;

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
					height: isHidden ? 0 : isExpanded ? (ticketsCount + 3) * 40.52 : isMinimal ? 37 * 2 : 121.56,
				}}
				exit={{
					height: 0,
					opacity: 0,
				}}
				className={cn('border rounded-xl flex flex-col overflow-hidden', className, {
					'border-destructive': isLost,
					'border-success': isWon,
					'border-purple-box': !isLost && !isWon,
					'bg-linear-to-b from-background to-background via-primary/20 via-60% grid': isExpanded,
					'grid-rows-4': isExpanded && ticketsCount === 1,
					'grid-rows-5': isExpanded && ticketsCount === 2,
					'grid-rows-6': isExpanded && ticketsCount === 3,
					'grid-rows-7': isExpanded && ticketsCount === 4,
					'grid-rows-8': isExpanded && ticketsCount === 5,
					'grid-rows-9': isExpanded && ticketsCount === 6,
					'grid-rows-10': isExpanded && ticketsCount === 7,
					'grid-rows-11': isExpanded && ticketsCount === 8,
					'grid-rows-12': isExpanded && ticketsCount === 9,
				})}
			>
				<Header ticket={ticket} old={old} hidden={isMinimal} isExpanded={isExpanded} />
				<motion.div
					animate={{ height: isExpanded ? '100%' : isMinimal ? '100%' : '33%' }}
					className={cn('flex flex-col items-center justify-center', {
						'row-span-9 grid grid-rows-9': ticketsCount === 9 && isExpanded,
						'row-span-8 grid grid-rows-8': ticketsCount === 8 && isExpanded,
						'row-span-7 grid grid-rows-7': ticketsCount === 7 && isExpanded,
						'row-span-6 grid grid-rows-6': ticketsCount === 6 && isExpanded,
						'row-span-5 grid grid-rows-5': ticketsCount === 5 && isExpanded,
						'row-span-4 grid grid-rows-4': ticketsCount === 4 && isExpanded,
						'row-span-3 grid grid-rows-3': ticketsCount === 3 && isExpanded,
						'row-span-2 grid grid-rows-2': ticketsCount === 2 && isExpanded,
					})}
				>
					<AnimatePresence mode="sync">
						{tickets
							.toSorted((a, b) => (winningLine ? (compareTickets(b, winningLine) > compareTickets(a, winningLine) ? 1 : -1) : 0))
							.slice(0, isExpanded ? tickets.length : 1)
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
										dynamicNumberClassName={(number) => cn({ 'stroke-success stroke-2': winningLine?.numbers.includes(number) && showWinningNumbers })}
										symbolClassName={cn({
											'stroke-success stroke-2': winningLine && line.symbol === winningLine.symbol && showWinningNumbers,
										})}
									/>
									<motion.div
										animate={{ rotate: isExpanded ? 180 : 0 }}
										className={cn('cursor-pointer', {
											'opacity-0': index > 0 || tickets.length === 1,
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
						<Link to={'/games/lottery/lotto/$round'} params={{ round: ticket.roundId.toString() }}>
							#{ticket.roundId.toString()}
						</Link>
					</div>
				)}
				<motion.div
					className={'flex flex-row items-center justify-center px-2 gap-2'}
					initial={{ height: 0, opacity: 0 }}
					animate={{
						height: isExpanded ? '100%' : isMinimal ? 0 : '33%',
						opacity: isMinimal ? 0 : 1,
					}}
					exit={{ height: 0, opacity: 0 }}
				>
					{old && <Claim ticket={ticket} />}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}

const Header: FC<{
	ticket: IBet;
	old: boolean;
	hidden: boolean;
	isExpanded: boolean;
}> = ({ ticket, old, hidden, isExpanded }) => {
	const { t } = useTranslation('lottery');
	const { data: interval = 0n } = useInterval();
	const { data: offset = 0n } = useRoundOffset();
	const finish = interval > 0n ? getRoundTimes(ticket.roundId, interval, offset).end : 0;
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
				<span>#{ticket.roundId.toString()}</span>
				<div className={'text text-muted-foreground'}>
					{ticket.tickets.length} {t('create.tickets', { count: ticket.tickets.length })}
				</div>
				{old && finish > 0 && <div className={'text-muted-foreground/50'}>{DateTime.fromSeconds(finish).toFormat('dd/MM T')}</div>}
			</div>
			{old ? <TicketStatus ticket={ticket} /> : <Countdown size={26} finish={finish} className={cn('text-muted-foreground text-xs')} />}
		</motion.div>
	);
};

export default Ticket;
