import { LotteryRoundABI } from '@betfinio/abi';
import { useWatchContractEvent } from 'wagmi';
import { useGetRoundFromParams, useRoundFinishedTimeStamp, useRoundStatus, useWinningLine } from '@/src/lib/query';

export const RoundWatchers = () => {
	const roundAddress = useGetRoundFromParams();

	const { refetch: refetchRoundStatus } = useRoundStatus(roundAddress);
	const { refetch: refetchWinningLine } = useWinningLine(roundAddress);
	const { refetch: refetchRoundFinishedTimeStamp } = useRoundFinishedTimeStamp(roundAddress);
	useWatchContractEvent({
		address: roundAddress,
		abi: LotteryRoundABI,
		eventName: 'RoundFinished',
		onLogs: async () => {
			await refetchWinningLine();
			await refetchRoundStatus();
			await refetchRoundFinishedTimeStamp();
		},
	});

	return null;
};
