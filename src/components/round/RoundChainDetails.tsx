import { cn } from '@betfinio/components';
import { ShieldCheckIcon } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetRoundFromParams, useRoundDetails } from '@/src/lib/query';

export const RoundChainDetails: FC = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const roundId = useGetRoundFromParams();
	const { data: roundDetails } = useRoundDetails(roundId);

	// Only show for settled rounds
	const isSettled = roundDetails?.status === 'settled';
	if (!isSettled) return null;

	return (
		<div className={cn('my-5')}>
			<div className={cn('flex items-center justify-center gap-2 flex-col')}>
				<div className={'text-tertiary-foreground font-semibold flex items-center gap-2'}>
					{t('proofOfRandom')} <ShieldCheckIcon className={'text-success w-5 h-5'} />
				</div>
				<div className={'text-center text-muted-foreground text-sm'}>Round #{roundId.toString()} settled on-chain</div>
			</div>
			<div className={'text-xs mt-1 text-center '}>
				<a
					className={'text-tertiary-foreground hover:text-green-roulette duration-300 underline'}
					href="https://betfin.gitbook.io/betfin-public/games-manual/proof-of-fairness/random-number-generation"
					target={'_blank'}
					rel="noreferrer"
				>
					{t('howItWorks')}
				</a>
			</div>
		</div>
	);
};
