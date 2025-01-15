import type { GTicket, ITicket } from '@/src/lib/types.ts';

export interface TimeDiff {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}
export const getDiff = (start: number, end: number): TimeDiff => {
	const diff = end - start;
	const days = Math.floor(diff / (60 * 60 * 24));
	const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
	const minutes = Math.floor((diff % (60 * 60)) / 60);
	const seconds = Math.floor(diff % 60);
	return { days, hours, minutes, seconds };
};

export const encodeLines = (lines: ITicket[]): GTicket[] => {
	return lines.map((line) => ({
		symbol: line.symbol,
		numbers: Number(line.numbers.reduce((acc, num) => acc + 2n ** BigInt(num), BigInt(0))),
	}));
};

export const decodeLines = (lines: GTicket[]): ITicket[] => {
	return lines.map((line) => ({
		symbol: line.symbol,
		numbers: line.numbers
			.toString(2)
			.split('')
			.reverse()
			.map((num, index) => (num === '1' ? index : -1))
			.filter((num) => num !== -1),
	}));
};
