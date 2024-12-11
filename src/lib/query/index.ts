import { fetchBalance, fetchRoundFinish, fetchTicketPrice } from '@/src/lib/api';
import type { ITicket } from '@/src/lib/types.ts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

export const useDraftTickets = () => {
	const queryClient = useQueryClient();
	const setTickets = (tickets: ITicket[]) => {
		queryClient.setQueryData(['lottery', 'tickets', 'draft'], tickets);
	};
	return {
		...useQuery<ITicket[]>({
			queryKey: ['lottery', 'tickets', 'draft'],
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
