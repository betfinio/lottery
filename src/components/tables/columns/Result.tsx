import WinningLine from '@/src/components/tables/columns/WinningLine.tsx';
import { useRoundFinish, useRoundStatus } from '@/src/lib/query';
import { RoundStatus } from '@/src/lib/types';
import type { Address } from 'viem';
import Countdown from '../../Countdown';

function Result({ round }: { round: Address }) {
	const { data = 0 } = useRoundStatus(round);
	const { data: finish = 0 } = useRoundFinish(round);

	if (data === RoundStatus.ENDED_WITHOUT_BETS) {
		return <div className={'text-muted-foreground'}>Ended</div>;
	}

	if (data === RoundStatus.PENDING) {
		return <div className={'text-muted-foreground'}>Waiting for result</div>;
	}

	if (data === RoundStatus.BETTING) {
		return (
			<div className={'text-muted-foreground flex items-start '}>
				<Countdown finish={finish} className="h-0" />
			</div>
		);
	}

	if (data === RoundStatus.CLAIMING || data === RoundStatus.DONE) {
		return <WinningLine round={round} />;
	}
	if (data === RoundStatus.REFUND) {
		return <div className={'text-muted-foreground'}>Refunded</div>;
	}
	return <div className={'text-muted-foreground'}>Waiting</div>;
}

export default Result;
