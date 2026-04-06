import { useQueryClient } from '@tanstack/react-query';
import { useWatchContractEvent } from 'wagmi';
import { LOTTERY } from '@/src/globals';
import { LotteryGameABI } from '@/src/lib/abi/LotteryGameABI';

function Watchers() {
	const queryClient = useQueryClient();
	useWatchContractEvent({
		address: LOTTERY,
		abi: LotteryGameABI,
		eventName: 'BetPlaced',
		onLogs: () => {
			queryClient.invalidateQueries({ queryKey: ['lottery'] });
		},
	});

	return null;
}

export default Watchers;
