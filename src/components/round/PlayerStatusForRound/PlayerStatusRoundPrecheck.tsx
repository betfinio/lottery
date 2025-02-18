import { useGetRoundFromParams, useRoundStatus, useRoundTicketsByPlayer } from '@/src/lib/query';
import { RoundStatus } from '@/src/lib/types';
import { ZeroAddress } from '@betfinio/abi';
import type { FC } from 'react';
import { useAccount } from 'wagmi';
import { PlayerStatusForRound } from './PlayerStatusForRound';

export const PlayerStatusRoundPrecheck: FC = () => {
	const { address = ZeroAddress } = useAccount();
	const round = useGetRoundFromParams();

	const { data: tickets = [], isFetching: isFetchingTickets } = useRoundTicketsByPlayer(round, address);
	const { data: roundStatus, isLoading } = useRoundStatus(round);
	const playerHasBets = tickets.length > 0 && !isFetchingTickets;

	const isRoundCalculated = roundStatus === RoundStatus.CLAIMING || roundStatus === RoundStatus.DONE;

	if (isRoundCalculated && !playerHasBets) return null;
	return (
		<div className="mt-4 md:min-h-[541px] flex justify-center items-center">
			<PlayerStatusForRound />
		</div>
	);
};
