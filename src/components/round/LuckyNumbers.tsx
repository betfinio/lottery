import Line from '@/src/components/shared/SharedLine';
import { useWinningLine } from '@/src/lib/query';
import type { ILine } from '@/src/lib/types';
import { randomize } from '@/src/lib/utils';
import { cn } from '@betfinio/components';
import { type FC, useEffect, useState } from 'react';
import type { Address } from 'viem';

interface LuckyNumbersProps {
	round: Address;
}
export const LuckyNumbers: FC<LuckyNumbersProps> = ({ round }) => {
	const { data = null, isFetching } = useWinningLine(round);
	const [currentLine, setCurrentLine] = useState<ILine>(randomize());
	useEffect(() => {
		if (data) return; // Stop animation when real data arrives

		const interval = setInterval(() => {
			setCurrentLine(randomize());
		}, 600);

		return () => clearInterval(interval); // Cleanup on unmount
	}, [data, isFetching]);

	const line = data || currentLine;
	return (
		<div className={cn({ 'blur animated-pulse': isFetching || !line })}>
			<Line line={line} numberClassName="stroke-success stroke-2" symbolClassName="stroke-success stroke-2" />
		</div>
	);
};
