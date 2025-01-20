import type { Address } from 'viem';

export interface ITicket {
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
}

export interface IRoundTicket {
	round: Address;
	player: Address;
	token: number;
	betAddress: Address;
	tickets: ITicket[];
}

export type ActiveTicketMode = 'full' | 'compact' | 'minimal' | 'expanded';
