import Line from '@/src/components/shared/Line.tsx';
import { useWinningLine } from '@/src/lib/query';
import { useManualRequest } from '@/src/lib/query/mutations.ts';
import type { Address } from 'viem';

function WinningLine({ round }: { round: Address }) {
	const { data = null } = useWinningLine(round);
	console.log(data);

	const { mutate } = useManualRequest();
	const handleRequest = () => {
		const result = confirm('Do you want to manual request?');
		if (result) {
			mutate({ round });
		}
	};
	if (data === null)
		return (
			<div className={'text-muted-foreground'} onClick={handleRequest}>
				Waiting
			</div>
		);
	return <Line line={data} />;
}

export default WinningLine;
