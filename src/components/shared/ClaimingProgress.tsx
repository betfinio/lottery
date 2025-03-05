import { useGetRoundFromParams, useRoundDetails, useRoundJackpots } from '@/src/lib/query';
import { ZeroAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { Progress, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';
import { CircleHelp } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

export const ClaimingProgressBar = () => {
	const { t } = useTranslation();
	const round = useGetRoundFromParams();
	const { data: roundDetails } = useRoundDetails(round);
	const { data: jackpots } = useRoundJackpots(round);

	const claimedJackpotTickets = useMemo(() => {
		if (!jackpots) return 0n;

		return Object.values(jackpots).reduce((acc, jackpot) => {
			return acc + BigInt(jackpot?.[0]?.tickets.length || 0n);
		}, 0n);
	}, [jackpots]);

	const totalTickets = roundDetails?.ticketCount;
	const ticketsClaimed = claimedJackpotTickets;
	const isAllClaimed = Number(ticketsClaimed) === Number(totalTickets);
	return (
		<div className={'w-full flex flex-wrap flex-row items-center gap-2 md:gap-3 lg:gap-4 mt-4'}>
			<div className="flex flex-grow items-center gap-x-6 flex-wrap">
				<div className={'flex-grow min-w-64'}>
					<Progress value={(Number(ticketsClaimed) / Number(totalTickets)) * 100} />
				</div>
			</div>
			<div className={'flex items-center gap-1'}>
				<span className={' font-semibold text-lg'}>
					{Number(roundDetails?.ticketClaimedCount)} /{' '}
					<span
						className={cn('', {
							'text-muted-foreground': !isAllClaimed,
						})}
					>
						{Number(totalTickets)}
					</span>
				</span>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger className="lottery">
							<CircleHelp className={'w-4 h-4 fill-foreground text-background'} />
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
