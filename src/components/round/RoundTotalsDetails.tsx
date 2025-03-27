import { useGetRoundFromParams, useLinesCount, useRoundDetails, useRoundJackpots, useTicketPrice } from '@/src/lib/query';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Bag } from '@betfinio/ui/dist/icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Ticket from '../icons/Ticket.tsx';
import { LuckyNumbers } from './LuckyNumbers.tsx';

export function RoundTotalsDetails() {
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const round = useGetRoundFromParams();
	const { data: lines = 10n, isLoading: isLinesLoading } = useLinesCount(round);
	const { isLoading: isPriceLoading } = useTicketPrice(round);
	const { data: roundDetails } = useRoundDetails(round);
	const { data: jackpots } = useRoundJackpots(round);
	const bank = roundDetails?.bank || 0n;

	const claimedJackpot = useMemo(() => {
		if (!jackpots) return 0n;

		return Object.values(jackpots).reduce((acc, jackpot) => {
			return acc + BigInt(jackpot?.[0]?.claimed || 0n);
		}, 0n);
	}, [jackpots]);

	const paidToStaking = useMemo(() => {
		return bank - claimedJackpot;
	}, [bank, claimedJackpot]);

	return (
		<div className="grid grid-cols-6 w-full gap-2 md:gap-4">
			<div className="border border-border rounded-lg p-2 py-4 md:py-6 flex flex-row items-center justify-center gap-4 col-span-3 md:col-span-2">
				<Ticket className="w-12 h-12 md:w-16 md:h-16 text-primary" />
				<div className="flex flex-col items-center">
					<BetValue className={cn('text-xl', { 'blur animated-pulse': isLinesLoading || isPriceLoading })} value={bank} withIcon />
					<div className={cn('hidden md:block', { 'blur animated-pulse': isLinesLoading })}>
						{Number(lines)} {t('lines')}
					</div>
				</div>
			</div>
			<div className="border border-border rounded-lg p-2 py-4 md:py-6 flex flex-row items-center justify-center gap-4 col-span-6 md:col-span-2 md:col-start-3 md:row-start-1">
				<div className="flex flex-col items-center gap-2">
					<div className="text-tertiary-foreground mb-2">{t('luckyNumbers')}</div>
					<LuckyNumbers round={round} />
				</div>
			</div>
			<div className="border border-border rounded-lg p-2 py-4 md:py-6 flex flex-row items-center justify-center gap-4 col-span-3  md:col-span-2 row-start-1">
				<Bag className={'w-12 h-12 md:w-16 md:h-16 text-secondary-foreground'} />
				<div className="flex flex-col items-center">
					<BetValue
						className={cn('text-xl', {
							'blur animated-pulse': isLinesLoading || isPriceLoading,
							'text-success': paidToStaking > 0n,
							'text-destructive': paidToStaking < 0n,
						})}
						value={paidToStaking}
						withIcon
					/>
					<div className="text-tertiary-foreground whitespace-nowrap">{t('paidToStaking')}</div>
				</div>
			</div>
		</div>
	);
}
