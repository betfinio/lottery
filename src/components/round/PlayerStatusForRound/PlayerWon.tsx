import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { IBet, ITicket } from '@/src/lib/types';
import { JackpotFrame } from '../../shared/JackpotTiara/JackpotFrame';
import Pagination from '../../shared/Pagination';
import { TicketCard } from '../../shared/TicketCard';

interface PlayerWonProps {
	winningLine: ITicket | null | undefined;
	winningCoef: bigint;
	bets: (IBet & { totalTickets: number })[];
	placedAmount: bigint;
	winingAmount: bigint;
	prizeAmount: bigint;
}
export const PlayerWon: FC<PlayerWonProps> = ({ winningLine, bets, placedAmount, winingAmount, prizeAmount }) => {
	const { t } = useTranslation('lottery');
	const multiplier = Number(winingAmount) / Number(placedAmount);
	const applyPagination = bets.length > 1;

	return (
		<div className="min-h-[590px] min-w-[388px]">
			<div className="border-2 border-[var(--aura)] rounded-lg relative pt-[224px] px-8 shadow-[0_0_10px_0] shadow-[var(--aura)] flex flex-col h-full">
				{/* Tiara */}
				<div className="absolute h-[208px] w-[320px] left-1/2 -translate-x-1/2 top-2">
					<div className="relative">
						<JackpotFrame animateStars className="text-[var(--gold)]" />

						<div className="absolute text-lg top-0 left-0 w-full h-full flex flex-col items-center justify-center">
							<div>
								<div>{t('round.youWon')}</div>
								{prizeAmount > 0n && (
									<BetValue className="text-secondary-foreground text-2xl font-bold" iconClassName="w-6 h-6" withIcon value={prizeAmount} withMillify={false} />
								)}
							</div>
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
							<div className="text-muted-foreground text-base mb-2">{t('round.yourWinningBets')}</div>
							<Pagination
								items={bets}
								itemsPerPage={1}
								renderItem={(bet) => <TicketCard ticket={bet} winningLine={winningLine} totalTickets={bet.totalTickets} />}
								className="grow h-auto flex flex-col justify-center"
							/>
						</div>
					) : (
						<div className="flex flex-col gap-2 justify-center">
							<div className="text-muted-foreground text-base mb-2">{t('round.yourWinningBets')}</div>
							{bets.map((bet, index: number) => (
								<TicketCard key={index} ticket={bet} winningLine={winningLine} totalTickets={bet.totalTickets} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
