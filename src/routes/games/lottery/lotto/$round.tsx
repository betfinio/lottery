import { PlayerStatusRoundPrecheck } from '@/src/components/round/PlayerStatusForRound/PlayerStatusRoundPrecheck';
import { RoundChainDetails } from '@/src/components/round/RoundChainDetails';
import { RoundHeader } from '@/src/components/round/RoundHeader';
import { RoundJackpots } from '@/src/components/round/RoundJackpots/RoundJackpots';
import { RoundTotalsDetails } from '@/src/components/round/RoundTotalsDetails';
import { RoundWatchers } from '@/src/components/round/RoundWatchers';
import ClaimingProgressBar from '@/src/components/shared/ClaimingProgress';
import { useGetRoundFromParams, useRoundStatus, useRoundTicketsByPlayer } from '@/src/lib/query';
import { RoundStatus } from '@/src/lib/types';
import { ZeroAddress } from '@betfinio/abi';
import { SonnerToaster as Toaster } from '@betfinio/components/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

export const statusesAllowedToSeeRound = [RoundStatus.CLAIMING, RoundStatus.DONE, RoundStatus.WAITING_FOR_REQUEST, RoundStatus.PENDING, RoundStatus.GENERATING];

export const Route = createFileRoute('/games/lottery/lotto/$round')({
	component: HistoryRoundPage,
});

export function HistoryRoundPage() {
	const navigate = useNavigate();
	const { address = ZeroAddress } = useAccount();
	const round = useGetRoundFromParams();
	const { isFetching: isFetchingTickets } = useRoundTicketsByPlayer(round, address);
	const { data: roundStatus, isLoading } = useRoundStatus(round);
	const showJackpotsTable = !isFetchingTickets && roundStatus && [RoundStatus.CLAIMING, RoundStatus.DONE].includes(roundStatus);
	const showChainDetails = roundStatus && [RoundStatus.CLAIMING, RoundStatus.DONE].includes(roundStatus);

	const showProgressBar = roundStatus && [RoundStatus.CLAIMING, RoundStatus.DONE].includes(roundStatus);
	useEffect(() => {
		if (roundStatus === undefined) return;
		if (!statusesAllowedToSeeRound.includes(roundStatus)) {
			navigate({ to: '/games/lottery/lotto', replace: true });
			return;
		}
	}, [roundStatus]);
	if (roundStatus === undefined || isLoading) return null;

	return (
		<>
			<RoundWatchers />
			<div className="lottery   p-2 md:p-3 lg:p-4 f 2xl:pr-0">
				<RoundHeader />
				<RoundTotalsDetails />
				<PlayerStatusRoundPrecheck />
				{showProgressBar && <ClaimingProgressBar />}
				{showJackpotsTable && (
					<div className="mt-4">
						<RoundJackpots />
					</div>
				)}

				{showChainDetails && <RoundChainDetails />}
			</div>
			<Toaster />
		</>
	);
}
