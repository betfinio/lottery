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
	isLocal?: boolean;
}

export interface IRoundTicketWithWinningCoef extends IRoundTicket {
	winningCoef: bigint;
	winingAmount: bigint;
	placedAmount: bigint;
}

export type ActiveTicketMode = 'full' | 'compact' | 'minimal' | 'expanded';

export enum RoundState {
	FILLING = 0,
	PLACING = 1,
	FINISHED = 2,
	//todo: add more states
}

export const EMPTY_LINE: ILine = { symbol: 0, numbers: [0, 0, 0, 0, 0] };

export enum RoundStatus {
	NONE = 0,
	BETTING = 1,
	PENDING = 2,
	DONE = 3,
	CLAIMING = 4,
	WAITING_FOR_REQUEST = 5,
	REFUND = 6,
	READY_FOR_REFUND = 7,
	REFUNDING = 8,
	ENDED_WITHOUT_BETS = 9,
}

export interface JackpotCombination {
	player: Address;
	bet: Address;
	winAmount: bigint;
	ticketNumber: number;
}

export type DrawTab = 'draw' | 'tickets';
export type TicketsTab = 'active' | 'old';
