import { MAX_SHARES } from '@/src/globals';
import { useAdditionalJackpot, useGetRoundFromParams, useRoundDetails, useRoundTicketsByPlayer, useTicketPrice } from '@/src/lib/query';
import { ZeroAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Button } from '@betfinio/components/ui';
import { useNavigate } from '@tanstack/react-router';
import { TicketIcon, UserIcon } from 'lucide-react';
import millify from 'millify';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { StatBox } from '../../shared/StatBox';

export const PlayerDidNotWin: FC<{ playerHasBets: boolean }> = ({ playerHasBets }) => {
	const { address = ZeroAddress } = useAccount();

	const round = useGetRoundFromParams();
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const navigate = useNavigate();
	const { data: roundDetails, isLoading } = useRoundDetails(round);
	const { data: ticketPrice, isLoading: isTicketPriceLoading } = useTicketPrice(round);
	const { data: tickets = [], isFetching: isFetchingTickets } = useRoundTicketsByPlayer(round, address);
	const { data: additionalJackpot } = useAdditionalJackpot();

	const youCouldWinAmount = useMemo(() => {
		if (!ticketPrice) return 0n;
		if (playerHasBets) {
			const hasTicketsForMainJackpot = tickets.some((ticket) => ticket.lines.length >= 3);
			return hasTicketsForMainJackpot ? ticketPrice * 40_000n : 15_000n;
		}
		return BigInt(MAX_SHARES) * BigInt(ticketPrice) + (additionalJackpot ?? 0n);
	}, [ticketPrice, roundDetails]);
	return (
		<div className="h-fit md:h-[590px]  min-w-[388px] border-2 border-aura rounded-lg p-8 flex flex-col items-center md:justify-between gap-4 ">
			<div className="text-2xl font-semibold mb-4 md:mb-11">{t('roundIsOver')}</div>
			<div className="flex flex-col gap-2 md:gap-4 items-center mb-4 md:mb-11">
				<div className="text-base font-semibold">{t('youCouldWin')}</div>
				<div
					className={cn('text-2xl font-semibold text-secondary-foreground', {
						'animate-pulse blur-sm': isFetchingTickets || isTicketPriceLoading,
					})}
				>
					<BetValue value={youCouldWinAmount} withIcon withMillify={false} />
				</div>
			</div>
			<div className="flex gap-4 items-end w-full grow">
				<StatBox
					className="w-full min-w-14"
					isLoading={isLoading}
					label={t('ticketLines')}
					value={millify(roundDetails?.linesCount ?? 0)}
					icon={<TicketIcon className="w-4 h-4" />}
				/>
				<StatBox
					className="w-full min-w-14"
					isLoading={isLoading}
					label={t('tickets')}
					value={millify(roundDetails?.ticketCount ?? 0)}
					icon={<UserIcon className="w-4 h-4" />}
				/>
				<StatBox className="w-full min-w-14" isLoading={isLoading} label={t('volume')} value={<BetValue value={roundDetails?.bank ?? 0n} withIcon />} />
			</div>
			<div className=" w-full">
				<Button onClick={() => navigate({ to: '/games/lottery/lotto' })} className="w-full" variant="default">
					{t('backToCurrentRound')}
				</Button>
			</div>
		</div>
	);
};
