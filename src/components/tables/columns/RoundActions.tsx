import { useRoundStatus } from '@/src/lib/query';
import { useManualDistributeJackpot, useManualDistributeRefund, useManualRefund, useManualRequest } from '@/src/lib/query/mutations';
import { DropdownMenuItem, DropdownMenuSeparator } from '@betfinio/components/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from '@betfinio/components/ui';
import { MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import type { Address } from 'viem';

interface RoundActionsProps {
	handler: () => void;
	title: string;
}

function RoundActions({ round }: { round: Address }) {
	const { data = 0 } = useRoundStatus(round);

	const { mutate: request } = useManualRequest();
	const { mutate: refund } = useManualRefund();
	const { mutate: distributeRefund } = useManualDistributeRefund();
	const { mutate: distributeJackpot } = useManualDistributeJackpot();

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
	const handleJackpot = () => {
		const result = confirm('Are you sure you want to distribute the jackpot?');
		if (result) {
			distributeJackpot({ round });
		}
	};

	const actions: RoundActionsProps[] = useMemo(() => {
		const options: RoundActionsProps[] = [];
		if (data === 7) {
			options.push({
				handler: handleRefund,
				title: 'Refund',
			});
		}
		if (data === 5) {
			options.push({
				handler: handleRequest,
				title: 'Request',
			});
		}
		if (data === 8) {
			options.push({
				handler: handleDistributeRefund,
				title: 'Distribute Refund',
			});
		}
		if (data === 9) {
			options.push({
				handler: handleRequest,
				title: 'Request',
			});
		}
		if (data === 3) {
			options.push({
				handler: handleJackpot,
				title: 'Distribute Jackpot',
			});
		}

		return options;
	}, [data, handleDistributeRefund, handleJackpot, handleRequest, handleRefund]);

	if (actions.length === 0 || data === 9) {
		return null;
	}

	return (
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
	);
}

export default RoundActions;
