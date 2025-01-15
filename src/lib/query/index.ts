import { fetchBalance, fetchBetsCount, fetchMultiAllowance, fetchRoundFinish, fetchRoundStatus, fetchTicketPrice, fetchTicketsCount } from '@/src/lib/api';
import { fetchActiveRounds, fetchActiveTickets } from '@/src/lib/gql';
import type { IRound, IRoundTicket, ITicket } from '@/src/lib/types.ts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Address } from 'viem';
import { useConfig } from 'wagmi';

/**
 *  Example of hook that reads data from fetcher(api
 */

export const useBalance = (address: Address) => {
	const config = useConfig();
	return useQuery<bigint>({
		queryKey: ['template', 'balance', address],
		queryFn: () => fetchBalance(address, config),
	});
};

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

export const useTicketsCount = (round: Address) => {
	const config = useConfig();
	return useQuery<number>({
		queryKey: ['lottery', 'round', round, 'ticketsCount'],
		queryFn: () => fetchTicketsCount(round, config),
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
		queryKey: ['lottery', 'rounds'],
		queryFn: () => fetchActiveRounds(),
	});
};
export const useActiveTicket = (address?: Address) => {
	return useQuery<IRoundTicket[]>({
		queryKey: ['lottery', 'tickets', 'active', address],
		queryFn: () => fetchActiveTickets(address),
	});
};

export const useBetsCount = (round: Address) => {
	const config = useConfig();
	return useQuery<number>({
		queryKey: ['lottery', 'round', round, 'betsCount'],
		queryFn: () => fetchBetsCount(round, config),
	});
};

export const useSelectedRound = () => {
	const { data: rounds = [] } = useActiveRounds();
	const queryClient = useQueryClient();
	useEffect(() => {
		if (rounds.length > 0) {
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
	const setTickets = (tickets: ITicket[]) => {
		queryClient.setQueryData(['lottery', 'lines', 'draft'], tickets);
	};
	return {
		...useQuery<ITicket[]>({
			queryKey: ['lottery', 'lines', 'draft'],
			initialData: [{ numbers: [0, 0, 0, 0, 0], symbol: 0 }],
		}),
		setTickets,
	};
};

export const useRoundFinish = (round: Address) => {
	const config = useConfig();
	return useQuery<number>({
		queryKey: ['lottery', 'round', round, 'finish'],
		queryFn: () => fetchRoundFinish(round, config),
		refetchOnMount: false,
	});
};
