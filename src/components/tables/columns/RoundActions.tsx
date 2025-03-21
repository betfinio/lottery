import { useRoundStatus } from '@/src/lib/query';
import { useManualDistributeJackpot, useManualDistributeRefund, useManualRefund, useManualRequest } from '@/src/lib/query/mutations';
import { RoundStatus } from '@/src/lib/types';
import { DropdownMenuItem } from '@betfinio/components/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@betfinio/components/ui';
import { MoreHorizontal } from 'lucide-react';
import { type MouseEvent, useMemo } from 'react';
import type { Address } from 'viem';

interface RoundActionsProps {
	handler: (e: MouseEvent) => void;
	title: string;
}

function RoundActions({ round }: { round: Address }) {
	const { data = 0 } = useRoundStatus(round);

	const { mutate: request } = useManualRequest();
	const { mutate: refund } = useManualRefund();
	const { mutate: distributeRefund } = useManualDistributeRefund();
	const { mutate: distributeJackpot } = useManualDistributeJackpot();

	const handleRequest = (e: MouseEvent) => {
		e.stopPropagation();
		const result = confirm('Are you sure you want to request the result?');
		if (result) {
			request({ round });
		}
	};
	const handleRefund = (e: MouseEvent) => {
		e.stopPropagation();
		const result = confirm('Are you sure you want to refund the round?');
		if (result) {
			refund({ round });
		}
	};
	const handleDistributeRefund = (e: MouseEvent) => {
		e.stopPropagation();
		const result = confirm('Are you sure you want to distribute the refund?');
		if (result) {
			distributeRefund({ round });
		}
	};
	const handleJackpot = (e: MouseEvent) => {
		e.stopPropagation();
		const result = confirm('Are you sure you want to distribute the jackpot?');
		if (result) {
			distributeJackpot({ round });
		}
	};
	const actions: RoundActionsProps[] = useMemo(() => {
		const options: RoundActionsProps[] = [];
		if (data === RoundStatus.READY_FOR_REFUND) {
			options.push({
				handler: handleRefund,
				title: 'Refund',
			});
		}
		if (data === RoundStatus.WAITING_FOR_REQUEST) {
			options.push({
				handler: handleRequest,
				title: 'Request',
			});
		}
		if (data === RoundStatus.REFUNDING) {
			options.push({
				handler: handleDistributeRefund,
				title: 'Distribute Refund',
			});
		}
		if (data === RoundStatus.DONE) {
			options.push({
				handler: handleJackpot,
				title: 'Distribute Jackpot',
			});
		}

		return options;
	}, [data, handleDistributeRefund, handleJackpot, handleRequest, handleRefund]);

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
