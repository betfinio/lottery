import type { GTicket, ILine } from '@/src/lib/types.ts';
import confetti from 'canvas-confetti';
import { DateTime } from 'luxon';
import { type Address, decodeAbiParameters } from 'viem';
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

export const parseLine = (line: Address): ILine => {
	const decoded = decodeAbiParameters([{ type: 'uint8' }, { type: 'uint32' }], line);
	return decodeLine({
		symbol: decoded[0],
		numbers: decoded[1],
	});
};

export const randomize = (from = 1): ILine => {
	// Fisher-Yates shuffle algorithm for better randomization
	const numbers = Array.from({ length: 25 - from + 1 }, (_, i) => i + from); // [from, from+1, ..., 25]
	for (let i = numbers.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[numbers[i], numbers[j]] = [numbers[j], numbers[i]];
	}
	// Take first 5 numbers after shuffle
	const selectedNumbers = numbers.slice(0, 5).sort((a, b) => a - b);
	// select a random symbol
	const symbol = Math.floor(Math.random() * 5) + 1;
	return { symbol, numbers: selectedNumbers };
};

export const equals = (a: ILine, b: ILine): boolean => {
	return a.symbol === b.symbol && a.numbers.length === b.numbers.length && a.numbers.every((n, i) => n === b.numbers[i]);
};
export const partlyEquals = (a: ILine, b: ILine, numberIndex: number): boolean => {
	const sortedA = [...a.numbers].sort((a, b) => a - b);
	return b.numbers.includes(sortedA[numberIndex]);
};

export const compareLines = (a: ILine, b: ILine, symbolUnlocked: boolean): number => {
	// count same numbers
	const sameBits = a.numbers.filter((n) => b.numbers.includes(n)).length;
	// check if 5 numbers are same
	if (sameBits === 5) {
		// check if symbol is same
		if (a.symbol === b.symbol && symbolUnlocked) {
			return 40_000; // COMBINATION: 5+1
		}
		return 15_000; // COMBINATION: 5
	}
	// check if 4 numbers are same
	if (sameBits === 4) {
		// check if symbol is same
		if (a.symbol === b.symbol && symbolUnlocked) {
			return 400; // COMBINATION: 4+1
		}
		return 50; // COMBINATION: 4
	}
	// check if 3 numbers are same
	if (sameBits === 3) {
		// check if symbol is same
		if (a.symbol === b.symbol && symbolUnlocked) {
			return 5; // COMBINATION: 3+1
		}
		return 1; // COMBINATION: 3
	}
	// check if 2 numbers are same
	if (sameBits === 2) {
		// check if symbol is same
		if (a.symbol === b.symbol && symbolUnlocked) {
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

export const getTimeFromSeconds = (seconds: number) => {
	return DateTime.fromSeconds(seconds).toFormat('DD, T');
};

export const COMBINATIONS_MAP = Object.freeze({
	'5+1': { coeficient: 40_000, combination: '5 + 1' },
	'5': { coeficient: 15_000, combination: '5' },
	'4+1': { coeficient: 400, combination: '4 + 1' },
	'4': { coeficient: 50, combination: '4' },
	'3+1': { coeficient: 5, combination: '3 + 1' },
	'3': { coeficient: 1, combination: '3' },
	'2+1': { coeficient: 1, combination: '2 + 1' },
	'0': { coeficient: 0, combination: '0' },
} as const);

export const COMBINATIONS_HEX_MAP = Object.freeze({
	'0x322b31': '2+1',
	'0x33': '3',
	'0x332b31': '3+1',
	'0x34': '4',
	'0x342b31': '4+1',
	'0x35': '5',
	'0x352b31': '5+1',
} as const);

export const COMBINATIONS_HEX_MAP_REVERSED = Object.freeze({
	'2+1': '0x322b31',
	'3': '0x33',
	'3+1': '0x332b31',
	'4': '0x34',
	'4+1': '0x342b31',
	'5': '0x35',
	'5+1': '0x352b31',
} as const);

export const shootConfetti = () => {
	confetti({
		particleCount: 100,
		angle: -90,
		spread: 360,
		startVelocity: 30,
		origin: { x: 0.5, y: 0.1 },
		colors: ['#FF2A51', '#B100A8', '#FFB300', '#B0D100', '#2462E7'],
	});

	confetti({
		particleCount: 50,
		spread: 360,
		startVelocity: 40,
		gravity: 0,
		decay: 0.96,
		scalar: 2,
		shapes: ['circle'],
		colors: ['#FF2A51', '#B100A8', '#FFB300', '#B0D100', '#2462E7'],
		origin: { x: 0.5, y: 0.4 },
	});
};
