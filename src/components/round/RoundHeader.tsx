import { cn } from '@betfinio/components';
import { Button } from '@betfinio/components/ui';
import { Link } from '@tanstack/react-router';
import { Undo2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getRoundTimes, useGetRoundFromParams, useInterval, useRoundOffset } from '@/src/lib/query';
import { getTimeFromSeconds } from '@/src/lib/utils';
import { CopyLocation } from '../shared/CopyLocation';

export const RoundHeader = () => {
	const roundId = useGetRoundFromParams();
	const { data: interval = 0n } = useInterval();
	const { data: offset = 0n } = useRoundOffset();
	const { end } = getRoundTimes(roundId, interval, offset);

	const { t } = useTranslation('lottery', {
		keyPrefix: 'round',
	});
	const { t: tShared } = useTranslation('shared', { keyPrefix: 'clipboard' });
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
					{t('drawId')} # {roundId.toString()}
				</div>
				<div>
					<div
						className={cn('text-sm text-tertiary-foreground', {
							'animate-pulse blur-xs': interval === 0n,
						})}
					>
						{getTimeFromSeconds(end || 1)}
					</div>
				</div>
			</div>
			<div className="flex items-center gap-2 absolute right-0 top-2 ">
				<CopyLocation toastMessage={tShared('copied')} iconClassName="w-4 h-4" className="flex gap-2 items-center">
					<div className="cursor-pointer">{t('share')}</div>
				</CopyLocation>
			</div>
		</div>
	);
};
