import WinningLine from '@/src/components/tables/columns/WinningLine.tsx';
import { useRoundStatus } from '@/src/lib/query';
import { useManualDistributeRefund, useManualRefund, useManualRequest } from '@/src/lib/query/mutations';
import { Button } from '@betfinio/components/ui';
import type { Address } from 'viem';

function Result({ round }: { round: Address }) {
	const { data = 0 } = useRoundStatus(round);

	const { mutate: request } = useManualRequest();
	const { mutate: refund } = useManualRefund();
	const { mutate: distributeRefund } = useManualDistributeRefund();

	if (data === 9) {
		return <div className={'text-muted-foreground'}>Ended</div>;
	}

	if (data === 2) {
		return <div className={'text-muted-foreground'}>Waiting for result</div>;
	}

	if (data === 1) {
		return <div className={'text-muted-foreground'}>Betting</div>;
	}

	if (data === 4 || data === 3) {
		return <WinningLine round={round} />;
	}
	if (data === 6) {
		return <div className={'text-muted-foreground'}>Refunded</div>;
	}
	return <div className={'text-muted-foreground'}>Waiting</div>;
}

export default Result;
