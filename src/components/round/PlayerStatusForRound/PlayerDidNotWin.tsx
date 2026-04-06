import { ZeroAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Button } from '@betfinio/components/ui';
import { useNavigate } from '@tanstack/react-router';
import { TicketIcon } from 'lucide-react';
import millify from 'millify';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useGetRoundFromParams, usePlayerBetsByRound, useRoundDetails, useTicketPrice } from '@/src/lib/query';
import { StatBox } from '../../shared/StatBox';

export const PlayerDidNotWin: FC<{ playerHasBets: boolean }> = ({ playerHasBets }) => {
	const { address = ZeroAddress } = useAccount();

	const roundId = useGetRoundFromParams();
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const navigate = useNavigate();
	const { data: roundDetails, isLoading } = useRoundDetails(roundId);
	const { data: ticketPrice, isLoading: isTicketPriceLoading } = useTicketPrice();
	const { isFetching: isFetchingTickets } = usePlayerBetsByRound(roundId, address);

	const youCouldWinAmount = useMemo(() => {
		if (!ticketPrice) return 0n;
		if (playerHasBets) {
			return ticketPrice * 40_000n;
		}
		return ticketPrice * 40_000n;
	}, [ticketPrice, playerHasBets]);

	return (
		<div className="h-fit md:h-[590px]  min-w-[388px] border-2 border-[var(--aura)] rounded-lg p-8 flex flex-col items-center md:justify-between gap-4 ">
			<div className="text-2xl font-semibold mb-4 md:mb-11">{t('roundIsOver')}</div>
			<div className="flex flex-col gap-2 md:gap-4 items-center mb-4 md:mb-11">
				<div className="text-base font-semibold">{t('youCouldWin')}</div>
				<div
					className={cn('text-2xl font-semibold text-secondary-foreground', {
						'animate-pulse blur-xs': isFetchingTickets || isTicketPriceLoading,
					})}
				>
					<BetValue value={youCouldWinAmount} withIcon withMillify={false} />
				</div>
			</div>
			<div className="flex gap-4 items-end w-full grow">
				<StatBox
					className="w-full min-w-14"
					isLoading={isLoading}
					label={t('bets')}
					value={millify(roundDetails?.betsCount ?? 0)}
					icon={<TicketIcon className="w-4 h-4" />}
				/>
				<StatBox className="w-full min-w-14" isLoading={isLoading} label={t('volume')} value={<BetValue value={roundDetails?.betsAmount ?? 0n} withIcon />} />
			</div>
			<div className=" w-full">
				<Button onClick={() => navigate({ to: '/games/lottery/lotto' })} className="w-full" variant="default">
					{t('backToCurrentRound')}
				</Button>
			</div>
		</div>
	);
};
