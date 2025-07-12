import { LotteryRoundABI } from '@betfinio/abi';
import { useQueryClient } from '@tanstack/react-query';
import { useWatchContractEvent } from 'wagmi';
import { useSelectedRound } from '@/src/lib/query';

function Watchers() {
	const { data: round } = useSelectedRound();
	const queryClient = useQueryClient();
	useWatchContractEvent({
		address: round?.address,
		abi: LotteryRoundABI,
		eventName: 'TicketSold',
		onLogs: () => {
			queryClient.invalidateQueries({ queryKey: ['lottery', 'round', round?.address, 'tickets'] });
			queryClient.invalidateQueries({ queryKey: ['lottery', 'round', round?.address, 'potentialJackpot'] });
			setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: ['lottery', 'round', 'active'] });
			}, 3000);
		},
	});

	return null;
}

export default Watchers;
