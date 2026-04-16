import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';
import type { Address } from 'viem';
import { useConfig } from 'wagmi';
import { LOTTERY } from '@/src/globals';
import {
	fetchBetClaimed,
	fetchBetPayout,
	fetchCoefficient,
	fetchCurrentRoundId,
	fetchInterval,
	fetchRoundBank,
	fetchRoundOffset,
	fetchTicketPrice,
	fetchWinningTicket,
} from '@/src/lib/api';
import { fetchPlayerBets, fetchPlayerBetsByRound, fetchPlayerRounds, fetchRoundBets, fetchRoundDetails, fetchRounds, fetchUnclaimedBets } from '@/src/lib/gql';
import { EMPTY_TICKET, type IBet, type IRound, type ITicket } from '@/src/lib/types';
import { decodeTicket } from '@/src/lib/utils';

/**
 * Parse the `$round` route param (a bigint-as-string) into a bigint.
 */
export const useGetRoundFromParams = (): bigint => {
	const { round } = useParams({ strict: false }) as { round?: string };
	return BigInt(round ?? '0');
};

export const useTicketPrice = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'ticketPrice'],
		queryFn: () => fetchTicketPrice(config),
	});
};

export const useInterval = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'interval'],
		queryFn: () => fetchInterval(config),
	});
};

export const useRoundOffset = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'roundOffset'],
		queryFn: () => fetchRoundOffset(config),
	});
};

export const useLotteryCoefficients = () => {
	const config = useConfig();
	return useQuery<bigint[]>({
		queryKey: ['lottery', 'coefficients'],
		queryFn: () => Promise.all([1, 2, 3, 4, 5, 6, 7].map((tier) => fetchCoefficient(tier, config))),
	});
};

export const useCurrentRoundId = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'currentRoundId'],
		queryFn: () => fetchCurrentRoundId(config),
		refetchInterval: 10_000,
	});
};

export const useRounds = () => {
	return useQuery<IRound[]>({
		queryKey: ['lottery', 'rounds'],
		queryFn: () => fetchRounds(),
	});
};

/**
 * Returns all subgraph rounds (past) + current + next N future rounds.
 * Future rounds without bets get an empty skeleton so the UI can show them for betting.
 */
const EMPTY_ROUNDS: IRound[] = [];

function sortRoundsEarliestFirst(rounds: IRound[]): IRound[] {
	return [...rounds].sort((a, b) => (a.roundId < b.roundId ? -1 : a.roundId > b.roundId ? 1 : 0));
}

export const useAvailableRounds = (futureCount = 10) => {
	const { data: currentRoundId } = useCurrentRoundId();
	const { data: subgraphRounds = EMPTY_ROUNDS } = useRounds();

	return useMemo(() => {
		if (currentRoundId === undefined) return sortRoundsEarliestFirst(subgraphRounds);

		const merged = new Map<string, IRound>();

		// Add all subgraph rounds (includes past rounds with bets)
		for (const r of subgraphRounds) {
			merged.set(r.roundId.toString(), r);
		}

		// Add current + future round skeletons (only if not already in subgraph)
		for (let i = 0; i < futureCount; i++) {
			const id = currentRoundId + BigInt(i);
			const key = id.toString();
			if (!merged.has(key)) {
				merged.set(key, {
					roundId: id,
					address: LOTTERY,
					status: 'open',
					started: 0,
					betsCount: 0,
					betsAmount: 0n,
					winNumbers: null,
					winSymbol: null,
				});
			}
		}

		return sortRoundsEarliestFirst(Array.from(merged.values()));
	}, [currentRoundId, subgraphRounds, futureCount]);
};

export const useRoundDetails = (roundId: bigint) => {
	return useQuery({
		queryKey: ['lottery', 'round', roundId.toString()],
		queryFn: () => fetchRoundDetails(roundId),
	});
};

export const useRoundBets = (roundId: bigint) => {
	return useQuery<IBet[]>({
		queryKey: ['lottery', 'round', roundId.toString(), 'bets'],
		queryFn: () => fetchRoundBets(roundId),
	});
};

export const usePlayerBetsByRound = (roundId: bigint, player: Address) => {
	return useQuery<IBet[]>({
		queryKey: ['lottery', 'round', roundId.toString(), 'bets', player],
		queryFn: () => fetchPlayerBetsByRound(roundId, player),
	});
};

export const usePlayerBets = (player?: Address) => {
	return useQuery<IBet[]>({
		queryKey: ['lottery', 'bets', player],
		queryFn: () => fetchPlayerBets(player),
		enabled: !!player,
	});
};

export const usePlayerRounds = (player?: Address) => {
	return useQuery<IRound[]>({
		queryKey: ['lottery', 'rounds', 'player', player],
		queryFn: () => fetchPlayerRounds(player),
		enabled: !!player,
	});
};

export const useSelectedRound = () => {
	const { data: currentRoundId } = useCurrentRoundId();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (currentRoundId !== undefined) {
			queryClient.setQueryData(['lottery', 'round', 'selected'], currentRoundId);
		}
	}, [currentRoundId, queryClient]);

	return useQuery<bigint>({
		queryKey: ['lottery', 'round', 'selected'],
		initialData: currentRoundId,
	});
};

export const useDraftTickets = () => {
	const queryClient = useQueryClient();
	const setTickets = (tickets: ITicket[]) => {
		queryClient.setQueryData(['lottery', 'tickets', 'draft'], tickets);
	};
	return {
		...useQuery<ITicket[]>({
			queryKey: ['lottery', 'tickets', 'draft'],
			initialData: [EMPTY_TICKET],
		}),
		setTickets,
	};
};

export const useWinningLine = (roundId: bigint) => {
	const config = useConfig();
	return useQuery({
		queryKey: ['lottery', 'round', roundId.toString(), 'winningLine'],
		queryFn: async () => {
			const result = await fetchWinningTicket(roundId, config);
			if (!result) return null;
			return decodeTicket(result);
		},
	});
};

export const useRoundBank = (roundId: bigint) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'round', roundId.toString(), 'bank'],
		queryFn: () => fetchRoundBank(roundId, config),
	});
};

export const useBetClaimed = (betAddress: Address) => {
	const config = useConfig();
	return useQuery<boolean>({
		queryKey: ['lottery', 'bet', betAddress, 'claimed'],
		queryFn: () => fetchBetClaimed(betAddress, config),
	});
};

export const useBetPayout = (betAddress: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'bet', betAddress, 'payout'],
		queryFn: () => fetchBetPayout(betAddress, config),
	});
};

export const useUnclaimedBets = () => {
	return useQuery<Address[]>({
		queryKey: ['lottery', 'unclaimedBets'],
		queryFn: () => fetchUnclaimedBets(),
	});
};

/**
 * Compute round timing from interval and offset.
 * Round N covers: [(N * interval - offset), ((N+1) * interval - offset))
 */
export const getRoundTimes = (roundId: bigint, interval: bigint, offset: bigint) => {
	const start = Number(roundId * interval - offset);
	const end = Number((roundId + 1n) * interval - offset);
	return { start, end };
};
