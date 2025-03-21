import { useGetRoundFromParams, useRoundDetails } from '@/src/lib/query';
import { getTimeFromSeconds } from '@/src/lib/utils';
import { truncateEthAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { Button } from '@betfinio/components/ui';
import { Link } from '@tanstack/react-router';
import { Undo2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CopyLocation } from '../shared/CopyLocation';

export const RoundHeader = () => {
	const round = useGetRoundFromParams();
	const { data: roundDetails, isLoading: isRoundDetailsLoading } = useRoundDetails(round);

	const { t } = useTranslation('lottery', {
		keyPrefix: 'round',
	});
	return (
		<div className="flex flex-row justify-center relative w-full">
			<div className="absolute left-0 top-0">
				<Button variant="ghost" asChild>
					<Link to={'/games/lottery/lotto'}>
						<Undo2Icon className="w-4 h-4 text-secondary-foreground" />
					</Link>
				</Button>
			</div>
			<div className="col-span-1 flex flex-col gap-1 items-center justify-center pb-4">
				<div className="font-bold flex flex-row justify-center w-full">
					<div>{t('drawId')} # </div> <div className="">{truncateEthAddress(round)}</div>
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
			<div className="flex items-center gap-2 absolute right-0 top-2 ">
				<CopyLocation toastMessage={t('copiedCurrentRoundRef')} iconClassName="w-4 h-4" className="flex gap-2 items-center">
					<div className="cursor-pointer">{t('share')}</div>
				</CopyLocation>
			</div>
		</div>
	);
};
