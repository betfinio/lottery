import { ZeroAddress } from '@betfinio/abi';
import { SonnerToaster as Toaster } from '@betfinio/components/ui';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { PlayerStatusRoundPrecheck } from '@/src/components/round/PlayerStatusForRound/PlayerStatusRoundPrecheck';
import { RoundChainDetails } from '@/src/components/round/RoundChainDetails';
import { RoundHeader } from '@/src/components/round/RoundHeader';
import { RoundTotalsDetails } from '@/src/components/round/RoundTotalsDetails';
import { RoundWatchers } from '@/src/components/round/RoundWatchers';
import ClaimingProgressBar from '@/src/components/shared/ClaimingProgress';
import { usePlayerBetsByRound, useRoundDetails } from '@/src/lib/query';

/** Subgraph statuses that are allowed to view the round details page */
export const statusesAllowedToSeeRound = ['spinning', 'settled', 'cancelled'];

export const Route = createFileRoute('/games/lottery/lotto/$round')({
	component: HistoryRoundPage,
});

/** Parse the $round route param into a bigint roundId */
export function useRoundIdFromParams(): bigint {
	const { round } = useParams({ from: '/games/lottery/lotto/$round' });
	return useMemo(() => BigInt(round), [round]);
}

export function HistoryRoundPage() {
	const navigate = useNavigate();
	const { address = ZeroAddress } = useAccount();
	const roundId = useRoundIdFromParams();
	const { data: roundDetails, isLoading } = useRoundDetails(roundId);
	const { isFetching: isFetchingTickets } = usePlayerBetsByRound(roundId, address);

	const roundStatus = roundDetails?.status;
	const showChainDetails = roundStatus && ['settled'].includes(roundStatus);
	const showProgressBar = roundStatus && ['settled'].includes(roundStatus);

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
			<div className="p-2 md:p-3 lg:p-4 f 2xl:pr-0">
				<RoundHeader />
				<RoundTotalsDetails />
				<PlayerStatusRoundPrecheck />
				{showProgressBar && <ClaimingProgressBar />}
				{showChainDetails && <RoundChainDetails />}
			</div>
			<Toaster />
		</>
	);
}
