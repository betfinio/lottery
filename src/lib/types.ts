import type { Address } from 'viem';

export interface ITicket {
	symbol: number;
	numbers: number[];
}

export interface IRound {
	address: Address;
	finish: number;
}
