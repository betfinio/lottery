import { cn } from '@betfinio/components';
import { type FC, useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';
import Line from '@/src/components/shared/SharedLine';
import { useWinningLine } from '@/src/lib/query';
import { useRoundFinishedNumbersSpitting } from '@/src/lib/query/state';
import { EMPTY_LINE, type ILine } from '@/src/lib/types';
import { randomize } from '@/src/lib/utils';

interface LuckyNumbersProps {
	round: Address;
}
export const LuckyNumbers: FC<LuckyNumbersProps> = ({ round }) => {
	const { isFetching } = useWinningLine(round);
	const [currentLine, setCurrentLine] = useState<ILine>(EMPTY_LINE);
	const winningNumbers = useRoundFinishedNumbersSpitting(round);

	const winningNumbersToShow = useMemo(() => {
		return winningNumbers.revealedNumbers.slice(0, 5);
	}, [winningNumbers.revealedNumbers]);

	const winningSymbolToShow = useMemo(() => {
		// Only return the 6th element if it exists in the array
		return winningNumbers.revealedNumbers.length >= 6 ? winningNumbers.revealedNumbers[5] : undefined;
	}, [winningNumbers.revealedNumbers]);

	useEffect(() => {
		if (winningNumbers.isComplete) {
			setCurrentLine({ numbers: winningNumbers.allNumbers.slice(0, 5), symbol: winningNumbers.allNumbers[5] });
		} // Stop animation when real data arrives

		const interval = setInterval(() => {
			if (winningNumbersToShow.length > 0) {
				setCurrentLine(randomize(Math.max(...winningNumbersToShow) + 1));
			} else {
				setCurrentLine(randomize());
			}
		}, 600);

		return () => clearInterval(interval); // Cleanup on unmount
	}, [winningNumbers.isComplete, isFetching, winningNumbersToShow]);

	// Create a hybrid line that combines revealed winning numbers with random numbers
	const line = useMemo(() => {
		// If we have no revealed numbers yet, just use the current random line
		if (winningNumbersToShow.length === 0) {
			return currentLine;
		}

		// Create a new hybrid line
		const hybridLine: ILine = {
			numbers: [...currentLine.numbers], // Start with current random numbers
			symbol: winningSymbolToShow !== undefined ? winningSymbolToShow : currentLine.symbol,
		};

		// Replace random numbers with revealed winning numbers
		for (let i = 0; i < winningNumbersToShow.length; i++) {
			hybridLine.numbers[i] = winningNumbersToShow[i];
		}

		return hybridLine;
	}, [currentLine, winningNumbersToShow, winningSymbolToShow]);

	return (
		<div className={cn({ 'blur-xs animated-pulse': isFetching || !line })}>
			<Line
				line={line}
				disableSymbol={false}
				dynamicNumberClassName={(_, index) =>
					cn({
						'stroke-success stroke-2': index < winningNumbersToShow.length,
					})
				}
				symbolClassName={cn({ 'stroke-success stroke-2': winningSymbolToShow !== undefined })}
			/>
		</div>
	);
};
