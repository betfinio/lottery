import { type Config, readContract, simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { type Address, encodeAbiParameters, parseAbiParameters } from 'viem';
import logger from '@/src/config/logger';
import { CORE, LOTTERY, LOTTERY_STRATEGY, PARTNER } from '@/src/globals';
import { BetABI } from '@/src/lib/abi/BetABI';
import { CoreBetABI } from '@/src/lib/abi/CoreBetABI';
import { LotteryGameABI } from '@/src/lib/abi/LotteryGameABI';
import { LotteryStrategyABI } from '@/src/lib/abi/LotteryStrategyABI';
import type { ITicket } from '@/src/lib/types';
import { encodeTickets } from '@/src/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// READ FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const fetchTicketPrice = async (config: Config): Promise<bigint> => {
	return readContract(config, {
		address: LOTTERY_STRATEGY,
		abi: LotteryStrategyABI,
		functionName: 'ticketPrice',
	});
};

export const fetchInterval = async (config: Config): Promise<bigint> => {
	return readContract(config, {
		address: LOTTERY,
		abi: LotteryGameABI,
		functionName: 'INTERVAL',
	});
};

export const fetchRoundOffset = async (config: Config): Promise<bigint> => {
	return readContract(config, {
		address: LOTTERY,
		abi: LotteryGameABI,
		functionName: 'ROUND_OFFSET',
	});
};

export const fetchCurrentRoundId = async (config: Config): Promise<bigint> => {
	return readContract(config, {
		address: LOTTERY,
		abi: LotteryGameABI,
		functionName: 'getCurrentRoundId',
	});
};

export const fetchRoundInfo = async (roundId: bigint, config: Config) => {
	return readContract(config, {
		address: LOTTERY,
		abi: LotteryGameABI,
		functionName: 'getRound',
		args: [roundId],
	});
};

export const fetchWinningTicket = async (roundId: bigint, config: Config) => {
	logger.start('fetchWinningTicket:', roundId);
	const result = await readContract(config, {
		address: LOTTERY_STRATEGY,
		abi: LotteryStrategyABI,
		functionName: 'getRoundResult',
		args: [roundId],
	});
	if (!result[1]) return null; // not settled
	return { symbol: result[0].symbol, numbers: result[0].numbers };
};

export const fetchCoefficient = async (tier: number, config: Config): Promise<bigint> => {
	return readContract(config, {
		address: LOTTERY_STRATEGY,
		abi: LotteryStrategyABI,
		functionName: 'coefficients',
		args: [BigInt(tier)],
	});
};

export const fetchBetStatus = async (betAddress: Address, config: Config): Promise<number> => {
	return readContract(config, {
		address: betAddress,
		abi: BetABI,
		functionName: 'status',
	});
};

export const fetchBetPayout = async (betAddress: Address, config: Config): Promise<bigint> => {
	return readContract(config, {
		address: betAddress,
		abi: BetABI,
		functionName: 'payout',
	});
};

export const fetchBetClaimed = async (betAddress: Address, config: Config): Promise<boolean> => {
	return readContract(config, {
		address: LOTTERY_STRATEGY,
		abi: LotteryStrategyABI,
		functionName: 'claimed',
		args: [betAddress],
	});
};

export const fetchRoundBank = async (roundId: bigint, config: Config): Promise<bigint> => {
	return readContract(config, {
		address: LOTTERY_STRATEGY,
		abi: LotteryStrategyABI,
		functionName: 'roundBank',
		args: [roundId],
	});
};

// ═══════════════════════════════════════════════════════════════════════════
// WRITE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const placeBet = async (options: { tickets: ITicket[]; roundIds: bigint[]; recipient: Address }, config: Config) => {
	const { tickets, roundIds, recipient } = options;
	const ticketPrice = await fetchTicketPrice(config);
	const encodedTickets = encodeTickets(tickets);
	const totalAmount = ticketPrice * BigInt(tickets.length);

	// Place a bet for each selected round
	let lastHash: Address | undefined;
	for (const roundId of roundIds) {
		const data = encodeAbiParameters(parseAbiParameters(['uint256 targetRoundId, Ticket[] tickets', 'struct Ticket { uint8 symbol; uint32 numbers; }']), [
			roundId,
			encodedTickets,
		]);

		const { request } = await simulateContract(config, {
			abi: CoreBetABI,
			address: CORE,
			functionName: 'bet',
			args: [recipient, recipient, LOTTERY, totalAmount, data, PARTNER],
		});

		const hash = await writeContract(config, request);

		await waitForTransactionReceipt(config, { hash });
		lastHash = hash;
	}

	return lastHash;
};

export const claimBet = async (betAddress: Address, config: Config) => {
	const { request } = await simulateContract(config, {
		abi: LotteryGameABI,
		address: LOTTERY,
		functionName: 'claim',
		args: [betAddress],
	});
	return writeContract(config, request);
};

export const claimBatchBets = async (betAddresses: Address[], config: Config) => {
	const { request } = await simulateContract(config, {
		abi: LotteryGameABI,
		address: LOTTERY,
		functionName: 'claimBatch',
		args: [betAddresses],
	});
	return writeContract(config, request);
};

export const spinRound = async (roundId: bigint, config: Config) => {
	logger.start('spinRound:', roundId);
	try {
		const { request } = await simulateContract(config, {
			abi: LotteryGameABI,
			address: LOTTERY,
			functionName: 'spin',
			args: [roundId],
		});
		return writeContract(config, request);
	} catch (error) {
		logger.error('spinRound:', error);
		throw error;
	}
};

export const settleRound = async (roundId: bigint, config: Config) => {
	const { request } = await simulateContract(config, {
		abi: LotteryGameABI,
		address: LOTTERY,
		functionName: 'settle',
		args: [roundId],
	});
	return writeContract(config, request);
};

export const cancelRound = async (roundId: bigint, config: Config) => {
	const { request } = await simulateContract(config, {
		abi: LotteryGameABI,
		address: LOTTERY,
		functionName: 'cancelRound',
		args: [roundId],
	});
	return writeContract(config, request);
};

export const refundBatch = async (betAddresses: Address[], config: Config) => {
	const { request } = await simulateContract(config, {
		abi: LotteryGameABI,
		address: LOTTERY,
		functionName: 'refundBatch',
		args: [betAddresses],
	});
	return writeContract(config, request);
};
