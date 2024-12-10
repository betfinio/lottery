import { TOKEN } from '@/src/globals.ts';
import { TokenABI } from '@betfinio/abi';
import { LotteryRoundABI } from '@betfinio/abi/dist/contracts/LotteryRound';
import { type Config, readContract } from '@wagmi/core';
import type { Address } from 'viem';

/**
 *  Example of function that reads data from blockchain
 */

export const fetchBalance = async (address: Address, config: Config): Promise<bigint> => {
	return (await readContract(config, {
		address: TOKEN,
		abi: TokenABI,
		functionName: 'balanceOf',
		args: [address],
	})) as bigint;
};

export const fetchTicketPrice = async (round: Address, config: Config): Promise<bigint> => {
	return await readContract(config, {
		address: round,
		abi: LotteryRoundABI,
		functionName: 'ticketPrice',
		args: [],
	});
};
