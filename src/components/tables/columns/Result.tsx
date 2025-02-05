import WinningLine from '@/src/components/tables/columns/WinningLine.tsx';
import { useRoundStatus } from '@/src/lib/query';
import { RoundStatus } from '@/src/lib/types';
import type { Address } from 'viem';

function Result({ round }: { round: Address }) {
	const { data = 0 } = useRoundStatus(round);

	if (data === RoundStatus.ENDED_WITHOUT_BETS) {
		return <div className={'text-muted-foreground'}>Ended</div>;
	}

	if (data === RoundStatus.PENDING) {
		return <div className={'text-muted-foreground'}>Waiting for result</div>;
	}

	if (data === RoundStatus.BETTING) {
		return <div className={'text-muted-foreground'}>Betting</div>;
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
