import { randomize } from '@/src/lib/utils';
import { type FC, useEffect, useState } from 'react';
import { AnimatedGridOfNumbners } from '../../shared/AnimatedGridOfNumbners';
import Pagination from '../../shared/Pagination';
import { TicketGridOfSymbols } from '../../shared/TicketGridOfSymbols';
import PlayerTickets from './PlayerTickets';
export const RoundNotCalculated: FC = () => {
	const [symbol, setSymbol] = useState(0);
	const [numbers, setNumbers] = useState<number[]>([]);

	useEffect(() => {
		const animateRandomValues = () => {
			const { numbers, symbol } = randomize();
			setNumbers(numbers);
			setSymbol(symbol);
		};

		const interval = setInterval(animateRandomValues, 200);
		return () => clearInterval(interval);
	}, []);
	return (
		<div className="flex flex-row gap-4 justify-center">
			<div className="w-96 flex flex-col gap-4">
				<AnimatedGridOfNumbners numbers={numbers} toggleNumber={() => {}} />
				<TicketGridOfSymbols symbol={symbol} numbers={numbers} changeSymbol={() => {}} />
			</div>
			<PlayerTickets className="!h-[360px]" />
		</div>
	);
};
