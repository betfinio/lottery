import { PlayerStatusForRound } from '@/src/components/round/PlayerStatusForRound/PlayerStatusForRound';
import { RoundChainDetails } from '@/src/components/round/RoundChainDetails';
import { RoundHeader } from '@/src/components/round/RoundHeader';
import { RoundJackpots } from '@/src/components/round/RoundJackpots/RoundJackpots';
import { RoundTotalsDetails } from '@/src/components/round/RoundTotalsDetails';
import { useGetRoundFromParams, useRoundStatus, useRoundTicketsByPlayer } from '@/src/lib/query';
import { RoundStatus } from '@/src/lib/types';
import { ZeroAddress } from '@betfinio/abi';
import { Toaster } from '@betfinio/components/ui';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useAccount } from 'wagmi';

const statusesAllowedToSeeRound = [RoundStatus.CLAIMING, RoundStatus.DONE, RoundStatus.WAITING_FOR_REQUEST, RoundStatus.PENDING];

export const Route = createFileRoute('/games/lottery/lotto/$round')({
	component: HistoryRoundPage,
});

function HistoryRoundPage() {
	const navigate = useNavigate();
	const { address = ZeroAddress } = useAccount();
	const round = useGetRoundFromParams();
	const { data: tickets = [], isFetching: isFetchingTickets } = useRoundTicketsByPlayer(round, address);
	const { data: roundStatus, isLoading } = useRoundStatus(round);

	const showJackpotsTable = tickets.length === 0 && !isFetchingTickets && roundStatus && [RoundStatus.CLAIMING, RoundStatus.DONE].includes(roundStatus);

	if (roundStatus === undefined || isLoading) return null;
	if (!statusesAllowedToSeeRound.includes(roundStatus)) {
		navigate({ to: '/games/lottery/lotto', replace: true });
		return;
	}

	return (
		<>
			<div className="lottery   p-2 md:p-3 lg:p-4 f 2xl:pr-0">
				<RoundHeader />
				<RoundTotalsDetails />
				<div className="mt-4 md:min-h-[541px] flex justify-center items-center">
					<PlayerStatusForRound />
				</div>

				<div className="mt-4">
					<RoundJackpots />
				</div>
				<RoundChainDetails />
			</div>
			<Toaster />
		</>
	);
}
