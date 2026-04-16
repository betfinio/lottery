import { cn } from '@betfinio/components';
import { Bag } from '@betfinio/components/icons';
import { BetValue } from '@betfinio/components/shared';
import { useTranslation } from 'react-i18next';
import { useGetRoundFromParams, useRoundBank, useRoundDetails } from '@/src/lib/query';
import Ticket from '../icons/Ticket.tsx';
import { LuckyNumbers } from './LuckyNumbers.tsx';

export function RoundTotalsDetails() {
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const roundId = useGetRoundFromParams();
	const { data: roundDetails, isLoading: isRoundDetailsLoading } = useRoundDetails(roundId);
	const { data: roundBank = 0n, isLoading: isBankLoading } = useRoundBank(roundId);
	const betsAmount = roundDetails?.betsAmount ?? 0n;
	const betsCount = roundDetails?.betsCount ?? 0;

	return (
		<div className="grid grid-cols-6 w-full gap-2 md:gap-4">
			<div className="border border-border rounded-lg p-2 py-4 md:py-6 flex flex-row items-center justify-center gap-4 col-span-3 md:col-span-2">
				<Ticket className="w-12 h-12 md:w-16 md:h-16 text-primary" />
				<div className="flex flex-col items-center">
					<BetValue
						className={cn('text-xl', { 'blur-xs animated-pulse': isRoundDetailsLoading || betsAmount === undefined })}
						value={betsAmount || 0n}
						withIcon
					/>
					<div className={cn('hidden md:block', { 'blur-xs animated-pulse': isRoundDetailsLoading })}>
						{betsCount} {t('tickets', { count: betsCount })}
					</div>
				</div>
			</div>
			<div className="border border-border rounded-lg p-2 py-4 md:py-6 flex flex-row items-center justify-center gap-4 col-span-6 md:col-span-2 md:col-start-3 md:row-start-1">
				<div className="flex flex-col items-center gap-2">
					<div className="text-tertiary-foreground mb-2">{t('luckyNumbers')}</div>
					<LuckyNumbers roundId={roundId} />
				</div>
			</div>
			<div className="border border-border rounded-lg p-2 py-4 md:py-6 flex flex-row items-center justify-center gap-4 col-span-3  md:col-span-2 row-start-1">
				<Bag className={'w-12 h-12 md:w-16 md:h-16 text-secondary-foreground'} />
				<div className="flex flex-col items-center">
					<BetValue
						className={cn('text-xl', {
							'blur-xs animated-pulse': isBankLoading,
							'text-success': roundBank > 0n,
						})}
						value={roundBank}
						withIcon
					/>
					<div className="text-tertiary-foreground whitespace-nowrap">{t('paidToStaking')}</div>
				</div>
			</div>
		</div>
	);
}
