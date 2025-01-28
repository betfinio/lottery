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

	const handleRequest = () => {
		const result = confirm('Are you sure you want to request the result?');
		if (result) {
			request({ round });
		}
	};
	const handleRefund = () => {
		const result = confirm('Are you sure you want to refund the round?');
		if (result) {
			refund({ round });
		}
	};
	const handleDistributeRefund = () => {
		const result = confirm('Are you sure you want to distribute the refund?');
		if (result) {
			distributeRefund({ round });
		}
	};

	if (data === 7) {
		return (
			<div className={'text-muted-foreground'}>
				<Button className="w-[80px]" onClick={handleRefund}>
					Refund
				</Button>
			</div>
		);
	}

	if (data === 5) {
		return (
			<div className={'text-muted-foreground'}>
				<Button className="w-[80px]" onClick={handleRequest}>
					Request
				</Button>
			</div>
		);
	}

	if (data === 8) {
		return (
			<div className={'text-muted-foreground'}>
				<Button onClick={handleDistributeRefund}>Distribute refund</Button>
			</div>
		);
	}
	if (data === 4) {
		return <WinningLine round={round} />;
	}
	if (data === 6) {
		return <div className={'text-muted-foreground'}>Refunded</div>;
	}
}

export default Result;
