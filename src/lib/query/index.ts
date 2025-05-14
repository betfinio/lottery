import {
	fetchAdditionalJackpot,
	fetchBoughtLinesCount,
	fetchEditAllowance,
	fetchExchangeRate,
	fetchFinishedRoundTransactionByRoundAddress,
	fetchFreeLinesCount,
	fetchLinesAvailability,
	fetchLinesCount,
	fetchLostTicketsClaimed,
	fetchLostTicketsToClaim,
	fetchMultiAllowance,
	fetchPotentialJackpot,
	fetchRoundFinish,
	fetchRoundFinishedTimeStamp,
	fetchRoundStatus,
	fetchSubscriptionId,
	fetchTicketClaimed,
	fetchTicketPrice,
	fetchTicketResult,
	fetchTicketRound,
	fetchTicketStatus,
	fetchTicketWinAmount,
	fetchUsedFreeLinesCount,
	fetchWinningLine,
	getRoundTotalBetsAndClaimedBets,
} from '@/src/lib/api';
import {
	fetchActiveRounds,
	fetchActiveTickets,
	fetchMyLinesSold,
	fetchOldRounds,
	fetchOldTickets,
	fetchPlayerRounds,
	fetchRoundDetails,
	fetchRoundJackpots,
	fetchRoundTicketsByPlayer,
	fetchUnclaimedTickets,
} from '@/src/lib/gql';
import { EMPTY_LINE, type ILine, type IRound, type IRoundTicket } from '@/src/lib/types.ts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { useEffect } from 'react';
import type { Address } from 'viem';
import { type Config, useConfig } from 'wagmi';
import { encodeLine } from '../utils';

/**
 *  Example of hook that reads data from fetcher(api
 */

export const useTicketPrice = (round?: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'ticketPrice', round],
		queryFn: () => fetchTicketPrice(round, config),
	});
};

export const useMultiAllowance = (address?: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'allowance', 'multibet', address],
		queryFn: () => fetchMultiAllowance(address, config),
	});
};

export const useEditAllowance = (address?: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'allowance', 'edit', address],
		queryFn: () => fetchEditAllowance(address, config),
	});
};

export const useRoundStatus = (round: Address) => {
	const config = useConfig();
	return useQuery({
		queryKey: ['lottery', 'round', round, 'status'],
		queryFn: () => fetchRoundStatus(round, config),
	});
};

export const useActiveRounds = () => {
	return useQuery<IRound[]>({
		queryKey: ['lottery', 'round', 'active'],
		queryFn: () => fetchActiveRounds(),
	});
};

export const useOldRounds = () => {
	return useQuery<IRound[]>({
		queryKey: ['lottery', 'round', 'old'],
		queryFn: () => fetchOldRounds(),
	});
};

export const useOldTickets = (address?: Address) => {
	return useQuery<IRoundTicket[]>({
		queryKey: ['lottery', 'tickets', 'old', address],
		queryFn: () => fetchOldTickets(address),
	});
};

export const useActiveTickets = (address?: Address) => {
	return useQuery({
		queryKey: ['lottery', 'tickets', 'active', address?.toLowerCase()],
		queryFn: () => fetchActiveTickets(address),
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
};

export const useSelectedRound = () => {
	const { data: rounds = [] } = useActiveRounds();
	const queryClient = useQueryClient();
	useEffect(() => {
		if (rounds.length > 0) {
			queryClient.setQueryData(['lottery', 'round', 'selected'], rounds[0]);
		}
	}, [rounds, queryClient]);
	return useQuery<IRound>({
		queryKey: ['lottery', 'round', 'selected'],
		initialData: rounds[0],
	});
};

export const useDraftLines = () => {
	const queryClient = useQueryClient();
	const setTickets = (tickets: ILine[]) => {
		queryClient.setQueryData(['lottery', 'lines', 'draft'], tickets);
	};
	return {
		...useQuery<ILine[]>({
			queryKey: ['lottery', 'lines', 'draft'],
			initialData: [EMPTY_LINE],
		}),
		setTickets,
	};
};

export const useWinningLine = (round: Address) => {
	const config = useConfig();
	return useQuery<ILine | null>({
		queryKey: ['lottery', 'round', round, 'winningLine'],
		queryFn: () => fetchWinningLine(round, config),
	});
};

export const useLinesCount = (round: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'round', round, 'bank'],
		queryFn: () => fetchLinesCount(round, config),
	});
};

export const useRoundFinish = (round: Address) => {
	const config = useConfig();
	return useQuery<number>({
		queryKey: ['lottery', 'round', round, 'finish'],
		queryFn: () => fetchRoundFinish(round, config),
		refetchOnMount: false,
	});
};

export const useTicketStatus = (ticket: Address) => {
	const config = useConfig();
	return useQuery({
		queryKey: ['lottery', 'ticket', ticket, 'status'],
		queryFn: () => fetchTicketStatus(ticket, config),
	});
};

export const useTicketResult = (ticket: Address, round: Address) => {
	const { data: winningLine } = useWinningLine(round);
	const config = useConfig();
	return useQuery({
		queryKey: ['lottery', 'ticket', ticket, round, 'result', winningLine],
		queryFn: () => fetchTicketResult(ticket, winningLine ? encodeLine(winningLine) : { symbol: 0, numbers: 0 }, config),
	});
};

export const useTicketRound = (ticket: Address) => {
	const config = useConfig();
	return useQuery({
		queryKey: ['lottery', 'ticket', ticket, 'round'],
		queryFn: () => fetchTicketRound(ticket, config),
	});
};

export const useTicketClaimed = (ticket: Address) => {
	const config = useConfig();
	return useQuery<boolean>({
		queryKey: ['lottery', 'ticket', ticket, 'claimed'],
		queryFn: () => fetchTicketClaimed(ticket, config),
	});
};

export const useTicketWinAmount = (ticket: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'ticket', ticket, 'winAmount'],
		queryFn: () => fetchTicketWinAmount(ticket, config),
	});
};

export const useAdditionalJackpot = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'additionalJackpot'],
		queryFn: () => fetchAdditionalJackpot(config),
	});
};

export const usePotentialJackpot = (round: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'round', round, 'potentialJackpot'],
		queryFn: () => fetchPotentialJackpot(round, config),
	});
};

export const useRoundTicketsByPlayer = (round: Address, address: Address) => {
	return useQuery<IRoundTicket[]>({
		queryKey: ['lottery', 'round', round, 'tickets', address],
		queryFn: () => fetchRoundTicketsByPlayer(round, address),
	});
};

export const usePlayerRounds = (address?: Address) => {
	return useQuery<IRound[]>({
		queryKey: ['lottery', 'rounds', 'player', address],
		queryFn: () => fetchPlayerRounds(address),
	});
};

export const linesAvailabilityQuery = (round: Address | undefined, lines: ILine[], config: Config) => {
	return { queryKey: ['lottery', 'round', round, 'lines', lines, 'availability'], queryFn: () => fetchLinesAvailability(round, lines, config) };
};
export const useLinesAvailability = (round: Address | undefined, lines: ILine[], enabled: boolean) => {
	const config = useConfig();
	return useQuery<boolean[]>({
		...linesAvailabilityQuery(round, lines, config),
		enabled,
	});
};

export const useGetRoundFromParams = () => {
	const { round } = useParams({ from: '/games/lottery/lotto/$round' });

	return round as Address;
};

export const useRoundDetails = (round: Address) => {
	return useQuery({
		queryKey: ['lottery', 'details', 'round', round],
		queryFn: () => fetchRoundDetails(round),
	});
};

export const useRoundJackpots = (round: Address) => {
	return useQuery({
		queryKey: ['lottery', 'jackpots', 'round', round],
		queryFn: () => fetchRoundJackpots(round),
	});
};

export const useFinishedRoundTransactionByRoundAddress = (round: Address) => {
	const config = useConfig();

	const { data: roundFinish, isLoading: isRoundFinishLoading } = useRoundFinish(round);
	return useQuery({
		queryKey: ['lottery', 'round', 'finishedRoundTransaction', round],
		queryFn: () => fetchFinishedRoundTransactionByRoundAddress(config, round, roundFinish),
		enabled: !!roundFinish && !isRoundFinishLoading,
	});
};

export const useMyLinesSold = (round: Address, player: Address) => {
	return useQuery<number>({
		queryKey: ['lottery', 'round', round, 'lines', player],
		queryFn: () => fetchMyLinesSold(round, player),
	});
};

export const useRoundFinishedTimeStamp = (round: Address) => {
	const config = useConfig();
	return useQuery<number>({
		queryKey: ['lottery', 'round', round, 'finishedTimeStamp'],
		queryFn: () => fetchRoundFinishedTimeStamp(config, round),
	});
};

export const useFreeLinesCount = (address: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'freeLines', address],
		queryFn: () => fetchFreeLinesCount(address, config),
	});
};

export const useUsedFreeLinesCount = (address: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'usedFreeLines', address],
		queryFn: () => fetchUsedFreeLinesCount(address, config),
	});
};

export const useBoughtLinesCount = (address: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'boughtLines', address],
		queryFn: () => fetchBoughtLinesCount(address, config),
	});
};

export const useLostTicketsToClaim = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'lostTicketsToClaim'],
		queryFn: () => fetchLostTicketsToClaim(config),
	});
};

export const useExchangeRate = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'exchangeRate'],
		queryFn: () => fetchExchangeRate(config),
	});
};

export const useLostTicketsClaimed = (address: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'lostTicketsClaimed', address],
		queryFn: () => fetchLostTicketsClaimed(address, config),
	});
};

export const useUnclaimedTickets = () => {
	return useQuery<bigint[]>({
		queryKey: ['lottery', 'unclaimedTickets'],
		queryFn: () => fetchUnclaimedTickets(),
	});
};

export const useSubscriptionId = () => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'subscriptionId'],
		queryFn: () => fetchSubscriptionId(config),
	});
};

export const useRoundTotalBetsAndClaimedBets = (round: Address) => {
	const config = useConfig();
	return useQuery<{
		betsCount: bigint;
		betsClaimed: bigint;
	}>({
		queryKey: ['lottery', 'round', round, 'totalBetsAndClaimedBets'],
		queryFn: () => getRoundTotalBetsAndClaimedBets(round, config),
	});
};
