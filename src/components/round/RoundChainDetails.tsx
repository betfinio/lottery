import { ETHSCAN } from '@/src/globals';
import { useFinishedRoundTransactionByRoundAddress, useGetRoundFromParams, useSelectedRound } from '@/src/lib/query';
import { ZeroAddress, truncateEthAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { useMediaQuery } from '@betfinio/components/hooks';
import { ShieldCheckIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

export const RoundChainDetails: FC = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const round = useGetRoundFromParams();

	const { data: roundFinished, isLoading } = useFinishedRoundTransactionByRoundAddress(round);

	const transactionHash = roundFinished?.[0]?.transactionHash;

	const { isMobile } = useMediaQuery();
	return (
		<div
			className={cn('my-5', {
				hidden: transactionHash === undefined,
			})}
		>
			<div className={cn('flex items-center justify-center gap-2  flex-col')}>
				<div className={'text-tertiary-foreground font-semibold flex items-center gap-2'}>
					{t('proofOfRandom')} <ShieldCheckIcon className={'text-success w-5 h-5'} />
				</div>

				<a
					href={`${ETHSCAN}/tx/${transactionHash}`}
					target={'_blank'}
					className={cn('block text-center underline cursor-pointer hover:text-secondary-foreground duration-300', {
						' blur-xs': isLoading,
					})}
					rel="noreferrer"
				>
					{isMobile ? truncateEthAddress(transactionHash || ZeroAddress) : transactionHash}
				</a>
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
