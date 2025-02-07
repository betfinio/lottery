import { useGetRoundFromParams, useRoundDetails } from '@/src/lib/query';
import { getTimeFromSeconds } from '@/src/lib/utils';
import { truncateEthAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { useTranslation } from 'react-i18next';

export const RoundHeader = () => {
	const round = useGetRoundFromParams();
	const { data: roundDetails, isLoading: isRoundDetailsLoading } = useRoundDetails(round);
	truncateEthAddress;
	const { t } = useTranslation('lottery', {
		keyPrefix: 'round',
	});
	return (
		<div className="flex flex-col gap-1 items-center justify-center py-4">
			<div className="font-bold">
				{t('drawId')} #{truncateEthAddress(round)}
			</div>
			<div>
				<div
					className={cn('text-sm text-tertiary-foreground', {
						'animate-pulse blur': isRoundDetailsLoading,
					})}
				>
					{getTimeFromSeconds(roundDetails?.finish || 1)}
				</div>
			</div>
		</div>
	);
};
