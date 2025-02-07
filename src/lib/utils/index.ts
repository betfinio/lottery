import type { GTicket, ILine } from '@/src/lib/types.ts';

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

export const encodeLines = (lines: ILine[]): GTicket[] => {
	return lines.map(encodeLine);
};

export const encodeLine = (line: ILine): GTicket => {
	return {
		symbol: line.symbol,
		numbers: Number(line.numbers.reduce((acc, num) => acc + 2n ** BigInt(num), BigInt(0))),
	};
};

export const decodeLine = (line: GTicket): ILine => {
	return {
		symbol: line.symbol,
		numbers: Array.from({ length: 25 }, (_, i) => i + 1).filter((num) => (line.numbers & (2 ** num)) !== 0),
	};
};

export const decodeLines = (lines: GTicket[]): ILine[] => {
	return lines.map(decodeLine);
};

export const randomize = (): ILine => {
	// generate 5 uniques numbers from 1 to 25
	const numbers = Array.from({ length: 25 }, (_, i) => i + 1) // [1, 2, ..., 25]
		.sort(() => Math.random() - 0.5)
		.slice(0, 5);
	// select a random symbol
	const symbol = Math.floor(Math.random() * 5) + 1;
	return { symbol, numbers };
};

export const equals = (a: ILine, b: ILine): boolean => {
	return a.symbol === b.symbol && a.numbers.length === b.numbers.length && a.numbers.every((n, i) => n === b.numbers[i]);
};
export const partlyEquals = (a: ILine, b: ILine, numberIndex: number): boolean => {
	const sortedA = [...a.numbers].sort((a, b) => a - b);
	return b.numbers.includes(sortedA[numberIndex]);
};

export const compareLines = (a: ILine, b: ILine): number => {
	// count same numbers
	const sameBits = a.numbers.filter((n) => b.numbers.includes(n)).length;
	// check if 5 numbers are same
	if (sameBits === 5) {
		// check if symbol is same
		if (a.symbol === b.symbol) {
			return 40_000; // COMBINATION: 5+1
		}
		return 15_000; // COMBINATION: 5
	}
	// check if 4 numbers are same
	if (sameBits === 4) {
		// check if symbol is same
		if (a.symbol === b.symbol) {
			return 400; // COMBINATION: 4+1
		}
		return 50; // COMBINATION: 4
	}
	// check if 3 numbers are same
	if (sameBits === 3) {
		// check if symbol is same
		if (a.symbol === b.symbol) {
			return 5; // COMBINATION: 3+1
		}
		return 1; // COMBINATION: 3
	}
	// check if 2 numbers are same
	if (sameBits === 2) {
		// check if symbol is same
		if (a.symbol === b.symbol) {
			return 1; // COMBINATION: 2+1
		}
	}
	// return 0 if no combination
	return 0;
};

export const isDuplicate = (lines: ILine[]): boolean => {
	return lines.some((line: ILine) =>
		lines.some((l: ILine) => l !== line && l.symbol === line.symbol && [...l.numbers].sort().join(',') === [...line.numbers].sort().join(',')),
	);
};
