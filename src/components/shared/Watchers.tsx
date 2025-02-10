import { useSelectedRound } from '@/src/lib/query';
import { LotteryRoundABI } from '@betfinio/abi';
import { useQueryClient } from '@tanstack/react-query';
import { useWatchContractEvent } from 'wagmi';

function Watchers() {
	const { data: round } = useSelectedRound();
	const queryClient = useQueryClient();
	useWatchContractEvent({
		address: round?.address,
		abi: LotteryRoundABI,
		eventName: 'TicketSold',
		onLogs: () => {
			queryClient.invalidateQueries({ queryKey: ['lottery', 'round'] });
		},
	});

	return null;
}

export default Watchers;
