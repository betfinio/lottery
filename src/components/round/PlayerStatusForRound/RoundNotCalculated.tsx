import { useGetRoundFromParams, useRoundStatus } from '@/src/lib/query';
import { useRoundFinishedNumbersSpitting } from '@/src/lib/query/state';
import { randomize } from '@/src/lib/utils';
import { type FC, useEffect, useMemo, useState } from 'react';
import { AnimatedGridOfNumbners } from '../../shared/AnimatedGridOfNumbners';
import { TicketGridOfSymbols } from '../../shared/TicketGridOfSymbols';
import PlayerTickets from './PlayerTickets';
export const RoundNotCalculated: FC = () => {
	const [symbol, setSymbol] = useState(0);
	const [numbers, setNumbers] = useState<number[]>([]);
	const round = useGetRoundFromParams();
	const { data: status, refetch: refetchRoundStatus } = useRoundStatus(round);
	const winningNumbers = useRoundFinishedNumbersSpitting(round);

	useEffect(() => {
		const animateRandomValues = () => {
			if (winningNumbers.isComplete) return;
			const { numbers, symbol } = randomize();
			setNumbers(numbers);
			setSymbol(symbol);
		};

		const interval = setInterval(animateRandomValues, 200);
		return () => clearInterval(interval);
	}, [winningNumbers.isComplete]);

	useEffect(() => {
		if (winningNumbers.isComplete) {
			// Add a 6-second delay before triggering the refetch
			const timer = setTimeout(() => {
				refetchRoundStatus();
			}, 6000);

			// Clean up the timer if the component unmounts
			return () => clearTimeout(timer);
		}
	}, [winningNumbers.isComplete, refetchRoundStatus]);

	const winningNumbersToShow = useMemo(() => {
		return winningNumbers.revealedNumbers.slice(0, 5);
	}, [winningNumbers.revealedNumbers]);

	const winningSymbolToShow = useMemo(() => {
		// Only return the 6th element if it exists in the array
		return winningNumbers.revealedNumbers.length >= 6 ? winningNumbers.revealedNumbers[5] : undefined;
	}, [winningNumbers.revealedNumbers]);

	const numbersToShow = winningNumbersToShow.length === 5 ? winningNumbersToShow : numbers;
	return (
		<div className="flex flex-col md:flex-row gap-4 justify-center">
			<div className="w-96 flex flex-col gap-4">
				<AnimatedGridOfNumbners primaryNumbers={winningNumbersToShow} numbers={numbersToShow} toggleNumber={() => {}} />
				<TicketGridOfSymbols symbol={winningSymbolToShow || symbol} numbers={numbers} changeSymbol={() => {}} />
			</div>
			<PlayerTickets className="!h-[360px]" />
		</div>
	);
};
