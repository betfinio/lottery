import { fetchMultiAllowance, fetchRoundFinish, fetchRoundStatus, fetchTicketPrice, fetchWinningLine } from '@/src/lib/api';
import { fetchActiveRounds, fetchActiveTickets, fetchOldRounds, fetchOldTickets } from '@/src/lib/gql';
import type { ILine, IRound, IRoundTicket } from '@/src/lib/types.ts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Address } from 'viem';
import { useConfig } from 'wagmi';

/**
 *  Example of hook that reads data from fetcher(api
 */

export const useTicketPrice = (round: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'ticketPrice', round],
		queryFn: () => fetchTicketPrice(round, config),
	});
};

export const useMultiAllowance = (address?: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['lottery', 'allowance', address],
		queryFn: () => fetchMultiAllowance(address, config),
	});
};

export const useRoundStatus = (round: Address) => {
	const config = useConfig();
	return useQuery<number>({
		queryKey: ['lottery', 'round', round, 'status'],
		queryFn: () => fetchRoundStatus(round, config),
	});
};

export const useActiveRounds = () => {
	return useQuery<IRound[]>({
		queryKey: ['lottery', 'active', 'rounds'],
		queryFn: () => fetchActiveRounds(),
	});
};

export const useOldRounds = () => {
	return useQuery<IRound[]>({
		queryKey: ['lottery', 'old', 'rounds'],
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
		queryKey: ['lottery', 'tickets', 'active', address],
		queryFn: () => fetchActiveTickets(address),
	});
};

export const useSelectedRound = () => {
	const { data: rounds = [] } = useActiveRounds();
	const queryClient = useQueryClient();
	useEffect(() => {
		if (rounds.length > 0) {
			console.log(rounds[0]);
			queryClient.setQueryData(['lottery', 'round', 'selected'], rounds[0]);
		}
	}, [rounds]);
	return useQuery({
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
			initialData: [{ numbers: [0, 0, 0, 0, 0], symbol: 0 }],
		}),
		setTickets,
	};
};

export const useWinningLine = (round: Address) => {
	const config = useConfig();
	return useQuery({
		queryKey: ['lottery', 'round', round, 'winningLine'],
		queryFn: () => fetchWinningLine(round, config),
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
