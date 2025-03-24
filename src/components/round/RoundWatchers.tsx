import { useGetRoundFromParams, useRoundFinishedTimeStamp, useRoundStatus, useWinningLine } from '@/src/lib/query';
import { LotteryRoundABI } from '@betfinio/abi';
import { useWatchContractEvent } from 'wagmi';

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
			await refetchRoundStatus();
			await refetchRoundFinishedTimeStamp();
			await refetchWinningLine();
		},
	});

	return null;
};
