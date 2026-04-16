import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@betfinio/components/ui';
import { MoreHorizontal } from 'lucide-react';
import { type MouseEvent, useMemo } from 'react';
import { getRoundTimes, useInterval, useRoundOffset } from '@/src/lib/query';
import { useCancelRound, useSettleRound, useSpinRound } from '@/src/lib/query/mutations';

const REFUND_TIMEOUT = 24 * 60 * 60; // 24 hours in seconds

interface RoundActionsProps {
	handler: (e: MouseEvent) => void;
	title: string;
}

function RoundActions({ roundId, status }: { roundId: bigint; status: string }) {
	const { mutate: spin } = useSpinRound();
	const { mutate: settle } = useSettleRound();
	const { mutate: cancel } = useCancelRound();
	const { data: interval } = useInterval();
	const { data: offset } = useRoundOffset();

	const handleSpin = (e: MouseEvent) => {
		e.stopPropagation();
		const result = confirm('Are you sure you want to request the spin?');
		if (result) {
			spin({ roundId });
		}
	};
	const handleSettle = (e: MouseEvent) => {
		e.stopPropagation();
		const result = confirm('Are you sure you want to settle the round?');
		if (result) {
			settle({ roundId });
		}
	};
	const handleCancel = (e: MouseEvent) => {
		e.stopPropagation();
		const result = confirm('Are you sure you want to cancel the round?');
		if (result) {
			cancel({ roundId });
		}
	};

	const actions: RoundActionsProps[] = useMemo(() => {
		const options: RoundActionsProps[] = [];
		const now = Math.floor(Date.now() / 1000);
		const roundEnd = interval ? getRoundTimes(roundId, interval, offset ?? 0n).end : 0;
		const roundEnded = roundEnd > 0 && roundEnd <= now;

		// "open" round that has ended can be spun
		if (status === 'open' && roundEnded) {
			options.push({
				handler: handleSpin,
				title: 'Spin',
			});
		}
		// Cancel only available after REFUND_TIMEOUT past round end
		if (status === 'open' && roundEnd > 0 && now >= roundEnd + REFUND_TIMEOUT) {
			options.push({
				handler: handleCancel,
				title: 'Cancel',
			});
		}
		// "spinning" round with result ready can be settled
		if (status === 'spinning') {
			options.push({
				handler: handleSettle,
				title: 'Settle',
			});
		}
		return options;
	}, [status, interval, offset, roundId]);

	if (actions.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-row items-center justify-center gap-2 lg:gap-3">
			<DropdownMenu>
				<DropdownMenuTrigger>
					<MoreHorizontal className="w-4 h-4 text-muted-foreground" />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					{actions.map((action) => (
						<DropdownMenuItem key={action.title} onClick={action.handler}>
							{action.title}
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

export default RoundActions;
