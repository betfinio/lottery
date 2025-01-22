import type { Address } from 'viem';

export interface ILine {
	symbol: number;
	numbers: number[];
}

export interface GTicket {
	symbol: number;
	numbers: number;
}

export interface IRound {
	address: Address;
	finish: number;
	ticketCount: number;
	linesCount: number;
	bank: bigint;
	ticketPrice: bigint;
}

export interface IRoundTicket {
	round: Address;
	player: Address;
	token: number;
	betAddress: Address;
	lines: ILine[];
}

export type ActiveTicketMode = 'full' | 'compact' | 'minimal' | 'expanded';
