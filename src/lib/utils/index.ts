import confetti from 'canvas-confetti';
import { DateTime } from 'luxon';
import { type Address, decodeAbiParameters } from 'viem';
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

export const encodeTickets = (tickets: ITicket[]): GTicket[] => {
	return tickets.map(encodeTicket);
};

export const encodeTicket = (ticket: ITicket): GTicket => {
	return {
		symbol: ticket.symbol,
		numbers: Number(ticket.numbers.reduce((acc, num) => acc + 2n ** BigInt(num), BigInt(0))),
	};
};

export const decodeTicket = (ticket: GTicket): ITicket => {
	return {
		symbol: ticket.symbol,
		numbers: Array.from({ length: 25 }, (_, i) => i + 1).filter((num) => (ticket.numbers & (2 ** num)) !== 0),
	};
};

export const decodeTickets = (tickets: GTicket[]): ITicket[] => {
	return tickets.map(decodeTicket);
};

export const parseTicket = (raw: Address): ITicket => {
	const decoded = decodeAbiParameters([{ type: 'uint8' }, { type: 'uint32' }], raw);
	return decodeTicket({
		symbol: decoded[0],
		numbers: decoded[1],
	});
};

export const randomize = (from = 1): ITicket => {
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

export const equals = (a: ITicket, b: ITicket): boolean => {
	return a.symbol === b.symbol && a.numbers.length === b.numbers.length && a.numbers.every((n, i) => n === b.numbers[i]);
};
export const partlyEquals = (a: ITicket, b: ITicket, numberIndex: number): boolean => {
	const sortedA = [...a.numbers].sort((a, b) => a - b);
	return b.numbers.includes(sortedA[numberIndex]);
};

export const compareTickets = (a: ITicket, b: ITicket): number => {
	// count same numbers
	const sameBits = a.numbers.filter((n) => b.numbers.includes(n)).length;
	if (sameBits === 5) {
		if (a.symbol === b.symbol) return 40_000; // 5+1
		return 15_000; // 5
	}
	if (sameBits === 4) {
		if (a.symbol === b.symbol) return 400; // 4+1
		return 50; // 4
	}
	if (sameBits === 3) {
		if (a.symbol === b.symbol) return 5; // 3+1
		return 1; // 3
	}
	if (sameBits === 2) {
		if (a.symbol === b.symbol) return 1; // 2+1
	}
	return 0;
};

export const calculateBetPrize = (winningTicket: ITicket, betTickets: ITicket[], ticketPrice: bigint) => {
	let prizeAmount = 0n;

	for (const ticket of betTickets) {
		const result = compareTickets(ticket, winningTicket);
		if (result > 0) {
			prizeAmount += BigInt(result) * ticketPrice;
		}
	}

	return { prizeAmount };
};

export const isDuplicate = (tickets: ITicket[]): boolean => {
	return tickets.some((ticket: ITicket) =>
		tickets.some((t: ITicket) => t !== ticket && t.symbol === ticket.symbol && [...t.numbers].sort().join(',') === [...ticket.numbers].sort().join(',')),
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

export const TIER_ORDER = ['5+1', '5', '4+1', '4', '3+1', '3', '2+1'] as const;

export const TIER_POSSIBLE_WINNERS = Object.freeze({
	'5+1': 1n,
	'5': 4n,
	'4+1': 100n,
	'4': 400n,
	'3+1': 1_900n,
	'3': 7_600n,
	'2+1': 11_400n,
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
