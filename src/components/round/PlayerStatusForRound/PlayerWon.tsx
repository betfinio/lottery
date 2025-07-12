import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { ILine, IRoundTicket } from '@/src/lib/types';
import { FreeTicketTooltip } from '../../shared/FreeTicketTooltip';
import { JackpotFrame } from '../../shared/JackpotTiara/JackpotFrame';
import Pagination from '../../shared/Pagination';
import { TicketCard } from '../../shared/TicketCard';

interface PlayerWonProps {
	winningLine: ILine | null | undefined;
	winningCoef: bigint;
	tickets: (IRoundTicket & { totalLines: number })[];
	placedAmount: bigint;
	winingAmount: bigint;
	freeTicketsCount: number;
	prizeAmount: bigint;
}
export const PlayerWon: FC<PlayerWonProps> = ({ winningLine, tickets, placedAmount, winingAmount, freeTicketsCount, prizeAmount }) => {
	const { t } = useTranslation('lottery');
	const multiplier = Number(winingAmount) / Number(placedAmount);
	const applyPagination = tickets.length > 1;

	return (
		<div className="min-h-[590px] min-w-[388px]">
			<div className="border-2 border-aura rounded-lg relative pt-[224px] px-8 shadow-[0_0_10px_0] shadow-aura flex flex-col h-full">
				{/* Tiara */}
				<div className="absolute h-[208px] w-[320px] left-1/2 -translate-x-1/2 top-2">
					<div className="relative">
						<JackpotFrame animateStars className="text-gold " />

						<div className="absolute text-lg top-0 left-0 w-full h-full flex flex-col items-center justify-center">
							<div className={cn({ 'mt-5': freeTicketsCount > 0 && prizeAmount > 0n })}>
								<div>{t('round.youWon')}</div>
								{prizeAmount > 0n && (
									<BetValue className="text-secondary-foreground text-2xl font-bold" iconClassName="w-6 h-6" withIcon value={prizeAmount} withMillify={false} />
								)}
							</div>

							{freeTicketsCount > 0 && (
								<div className="flex flex-row items-center gap-2">
									<div>+ {freeTicketsCount}</div>
									<FreeTicketTooltip />
								</div>
							)}
						</div>
					</div>
				</div>
				{/* Info */}
				<div className="flex gap-2 text-sm justify-between mb-4 text-muted-foreground items-center">
					<div className="flex flex-col items-center">
						<div>{t('round.betSize')}</div>
						<div className="text-secondary-foreground">
							<BetValue className="text-secondary-foreground" value={placedAmount} withIcon withMillify={false} />
						</div>
					</div>
					<div className="flex flex-col items-center">
						<div>{t('round.multiplicator')}</div>
						<div className={cn('', { 'text-success': multiplier > 1, 'text-destructive': multiplier < 1 })}>x{multiplier.toFixed(2)}</div>
					</div>
				</div>
				{/* Tickets */}
				<div className="grow relative flex flex-col">
					{applyPagination ? (
						<div className="grow flex-col flex gap-2">
							<div className="text-muted-foreground text-base mb-2">{t('round.yourWinningTickets')}</div>
							<Pagination
								items={tickets}
								itemsPerPage={1}
								renderItem={(ticket) => <TicketCard ticket={ticket} winningLine={winningLine} totalLines={ticket.totalLines} />}
								className="grow h-auto flex flex-col justify-center"
							/>
						</div>
					) : (
						<div className="flex flex-col gap-2 justify-center">
							<div className="text-muted-foreground text-base mb-2">{t('round.yourWinningTickets')}</div>
							{tickets.map((ticket, index: number) => (
								<TicketCard key={index} ticket={ticket} winningLine={winningLine} totalLines={ticket.totalLines} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
