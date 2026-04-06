import type { Address } from 'viem';

/** A single ticket: 5 numbers (1-25) + 1 symbol (1-5) */
export interface ITicket {
	symbol: number;
	numbers: number[];
}

/** Encoded ticket (bitmask representation) */
export interface GTicket {
	symbol: number;
	numbers: number;
}

export interface IRound {
	roundId: bigint;
	address: Address; // game contract address
	status: string; // "open" | "spinning" | "settled" | "cancelled"
	started: number;
	betsCount: number;
	betsAmount: bigint;
	winNumbers: number | null; // uint32 bitmask, null until settled
	winSymbol: number | null; // 1-5, null until settled
}

/** A bet: contains 1-10 tickets */
export interface IBet {
	roundId: bigint;
	player: Address;
	betAddress: Address;
	amount: bigint;
	status: string; // "pending" | "resolved" | "refunded"
	prize: bigint | null;
	tickets: ITicket[];
}

export interface IBetWithPrize extends IBet {
	prizeAmount: bigint;
}

export interface IBetWithWinningCoef extends IBet {
	winningCoef: bigint;
	winingAmount: bigint;
	prizeAmount: bigint;
	placedAmount: bigint;
}

export type ActiveTicketMode = 'full' | 'compact' | 'minimal' | 'expanded' | 'hidden';

export enum RoundStatusEnum {
	None = 0,
	Open = 1,
	SpinRequested = 2,
	ResultReady = 3,
	Settled = 4,
	Cancelled = 5,
}

export const EMPTY_TICKET: ITicket = { symbol: 0, numbers: [0, 0, 0, 0, 0] };

/** UI state for the ticket creation flow (filling tickets vs placing bet) */
export enum RoundState {
	FILLING = 'filling',
	PLACING = 'placing',
}

export type DrawTab = 'draw' | 'active' | 'old';
export type TicketsTab = 'active' | 'old';
