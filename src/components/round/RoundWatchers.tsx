import { useQueryClient } from '@tanstack/react-query';
import { useWatchContractEvent } from 'wagmi';
import { LOTTERY } from '@/src/globals';
import { LotteryGameABI } from '@/src/lib/abi/LotteryGameABI';
import { useGetRoundFromParams, useRoundDetails, useWinningLine } from '@/src/lib/query';

export const RoundWatchers = () => {
	const roundId = useGetRoundFromParams();
	const queryClient = useQueryClient();

	const { refetch: refetchWinningLine } = useWinningLine(roundId);
	const { refetch: refetchRoundDetails } = useRoundDetails(roundId);

	useWatchContractEvent({
		address: LOTTERY,
		abi: LotteryGameABI,
		eventName: 'RoundSettled',
		onLogs: async () => {
			await refetchWinningLine();
			await refetchRoundDetails();
			queryClient.invalidateQueries({ queryKey: ['lottery'] });
		},
	});

	return null;
};
