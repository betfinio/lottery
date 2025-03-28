import { useGetRoundFromParams, useRoundDetails } from '@/src/lib/query';
import { cn } from '@betfinio/components';
import { Progress, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';
import { CircleHelp } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const ClaimingProgressBar = () => {
	const { t } = useTranslation();
	const round = useGetRoundFromParams();
	const { data: roundDetails } = useRoundDetails(round);

	const { totalTickets, claimedTickets, isAllClaimed, progressPercentage } = useMemo(() => {
		const total = roundDetails?.ticketCount || 0;
		const claimed = roundDetails?.ticketClaimedCount || 0;
		return {
			totalTickets: total,
			claimedTickets: claimed,
			isAllClaimed: claimed === total,
			progressPercentage: total > 0 ? (claimed * 100) / total : 0,
		};
	}, [roundDetails]);

	return (
		<div className="w-full flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4 mt-4">
			<div className="flex flex-grow items-center gap-x-6 flex-wrap">
				<div className="flex-grow min-w-64">
					<Progress value={progressPercentage} />
				</div>
			</div>
			<div className="flex items-center gap-1">
				<span className="font-semibold text-lg">
					{claimedTickets} /{' '}
					<span
						className={cn({
							'text-muted-foreground': !isAllClaimed,
						})}
					>
						{totalTickets}
					</span>
				</span>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger className="lottery">
							<CircleHelp className="w-4 h-4 fill-foreground text-background" />
						</TooltipTrigger>
						<TooltipContent>
							<div>{t('round.ticketsClaimed')}</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
};

export default ClaimingProgressBar;
