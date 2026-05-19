import type { ExecutionResult } from 'graphql/execution';
import type { Address } from 'viem';
import {
	execute,
	LotteryPlayerBetsByRoundDocument,
	type LotteryPlayerBetsByRoundQuery,
	LotteryPlayerBetsDocument,
	type LotteryPlayerBetsQuery,
	LotteryRoundBetsDocument,
	type LotteryRoundBetsQuery,
	LotteryRoundDetailsDocument,
	type LotteryRoundDetailsQuery,
	LotteryRoundsByPlayerDocument,
	type LotteryRoundsByPlayerQuery,
	LotteryRoundsDocument,
	type LotteryRoundsQuery,
	LotteryUnclaimedBetsDocument,
	type LotteryUnclaimedBetsQuery,
} from '@/.graphclient';
import logger from '@/src/config/logger';
import { LOTTERY } from '@/src/globals';
import type { IBet, IRound } from '@/src/lib/types';
import { decodeTicket } from '@/src/lib/utils';

const populateRound = (round: {
	round: string;
	address: string;
	status: string;
	started: string;
	betsCount: string;
	betsAmount: string;
	winNumbers: string | null;
	winSymbol: number | null;
}): IRound => {
	return {
		roundId: BigInt(round.round),
		address: round.address.toLowerCase() as Address,
		status: round.status,
		started: Number(round.started),
		betsCount: Number(round.betsCount),
		betsAmount: BigInt(round.betsAmount),
		winNumbers: round.winNumbers !== null ? Number(round.winNumbers) : null,
		winSymbol: round.winSymbol !== null ? Number(round.winSymbol) : null,
	};
};

const populateBet = (bet: {
	player: string;
	amount: string;
	betAddress: string;
	status: string;
	prize: string | null;
	blockTimestamp: string;
	tickets: Array<{ numbers: string; symbol: number }>;
	round?: { round: string; status?: string; started?: string; betsAmount?: string; winNumbers?: string | null; winSymbol?: number | null };
}): IBet => {
	return {
		roundId: bet.round ? BigInt(bet.round.round) : 0n,
		player: bet.player.toLowerCase() as Address,
		betAddress: bet.betAddress.toLowerCase() as Address,
		amount: BigInt(bet.amount),
		status: bet.status,
		prize: bet.prize !== null ? BigInt(bet.prize) : null,
		tickets: bet.tickets.map((t) => decodeTicket({ symbol: Number(t.symbol), numbers: Number(t.numbers) })),
	};
};

export const fetchRounds = async (): Promise<IRound[]> => {
	logger.start('fetching rounds');
	const result: ExecutionResult<LotteryRoundsQuery> = await execute(LotteryRoundsDocument, {
		address: LOTTERY.toLowerCase(),
	});
	console.log(result.data);

	if (result.data?.rounds) {
		return result.data.rounds.map(populateRound);
	}
	return [];
};

export const fetchRoundDetails = async (roundId: bigint): Promise<IRound> => {
	logger.start('fetching round details', roundId);
	const result: ExecutionResult<LotteryRoundDetailsQuery> = await execute(LotteryRoundDetailsDocument, {
		address: LOTTERY.toLowerCase(),
		round: roundId.toString(),
	});
	if (result.data?.rounds?.[0]) {
		return populateRound(result.data.rounds[0]);
	}
	// Round has no bets yet — return a skeleton
	return {
		roundId,
		address: LOTTERY,
		status: 'open',
		started: 0,
		betsCount: 0,
		betsAmount: 0n,
		winNumbers: null,
		winSymbol: null,
	};
};

const ROUND_BETS_PAGE_SIZE = 1000;

export const fetchRoundBets = async (roundId: bigint): Promise<IBet[]> => {
	logger.start('fetching round bets', roundId);
	const allBets: IBet[] = [];
	let skip = 0;

	while (true) {
		const result: ExecutionResult<LotteryRoundBetsQuery> = await execute(LotteryRoundBetsDocument, {
			address: LOTTERY.toLowerCase(),
			round: roundId.toString(),
			first: ROUND_BETS_PAGE_SIZE,
			skip,
		});

		const page = result.data?.bets ?? [];
		if (page.length === 0) break;

		allBets.push(...page.map((bet) => populateBet({ ...bet, round: { round: roundId.toString() } })));

		if (page.length < ROUND_BETS_PAGE_SIZE) break;
		skip += ROUND_BETS_PAGE_SIZE;
	}

	return allBets;
};

export const fetchPlayerBetsByRound = async (roundId: bigint, player: Address): Promise<IBet[]> => {
	logger.start('fetching player bets by round', roundId, player);
	const result: ExecutionResult<LotteryPlayerBetsByRoundQuery> = await execute(LotteryPlayerBetsByRoundDocument, {
		address: LOTTERY.toLowerCase(),
		round: roundId.toString(),
		player: player.toLowerCase(),
	});
	if (result.data?.bets) {
		return result.data.bets.map(populateBet);
	}
	return [];
};

export const fetchPlayerBets = async (player?: Address): Promise<IBet[]> => {
	logger.start('fetching player bets', player);
	if (!player) return [];
	const result: ExecutionResult<LotteryPlayerBetsQuery> = await execute(LotteryPlayerBetsDocument, {
		address: LOTTERY.toLowerCase(),
		player: player.toLowerCase(),
	});
	if (result.data?.bets) {
		return result.data.bets.map(populateBet);
	}
	return [];
};

export const fetchPlayerRounds = async (player?: Address): Promise<IRound[]> => {
	logger.start('fetching player rounds', player);
	if (!player) return [];
	const result: ExecutionResult<LotteryRoundsByPlayerQuery> = await execute(LotteryRoundsByPlayerDocument, {
		address: LOTTERY.toLowerCase(),
		player: player.toLowerCase(),
	});
	if (result.data?.rounds) {
		return result.data.rounds.map(populateRound);
	}
	return [];
};

export const fetchUnclaimedBets = async (): Promise<Address[]> => {
	logger.start('fetching unclaimed bets');
	const result: ExecutionResult<LotteryUnclaimedBetsQuery> = await execute(LotteryUnclaimedBetsDocument, {
		address: LOTTERY.toLowerCase(),
	});
	if (result.data?.bets) {
		return result.data.bets.map((b) => b.betAddress.toLowerCase() as Address);
	}
	return [];
};
