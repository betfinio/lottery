import { LOTTERY_ADDRESS } from '@/src/globals';
import { useSelectedRound } from '@/src/lib/query';
import { LotteryABI, LotteryRoundABI, ZeroAddress } from '@betfinio/abi';
import { useWatchContractEvent } from 'wagmi';

function Watchers() {
	const { data: round } = useSelectedRound();

	useWatchContractEvent({
		address: round?.address,
		abi: LotteryRoundABI,
		eventName: 'TicketSold',
		onLogs: (logs) => {
			console.log(logs);
		},
	});

	return null;
}

export default Watchers;
