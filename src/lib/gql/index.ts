import { GetActiveRoundsDocument, type GetActiveRoundsQuery, GetActiveTicketsDocument, type GetActiveTicketsQuery, execute } from '@/.graphclient';
import logger from '@/src/config/logger';
import type { IRound, IRoundTicket } from '@/src/lib/types.ts';
import { decodeLines } from '@/src/lib/utils';
import { ZeroAddress } from '@betfinio/abi';
import type { ExecutionResult } from 'graphql/execution';
import type { Address } from 'viem';

export const fetchActiveRounds = async (): Promise<IRound[]> => {
	logger.start('fetching active rounds');
	const now = BigInt(Math.floor(Date.now() / 1000));
	const result: ExecutionResult<GetActiveRoundsQuery> = await execute(GetActiveRoundsDocument, { now: now.toString() });
	if (result.data?.rounds) {
		logger.success('fetching active rounds');
		return result.data.rounds.map((round) => ({ address: round.round.toLowerCase() as Address, finish: Number(round.timestamp) }) as IRound);
	}
	return [];
};

export const fetchActiveTickets = async (address?: Address): Promise<IRoundTicket[]> => {
	if (!address || address === ZeroAddress) {
		return [];
	}
	logger.start('fetching active tickets');
	const now = BigInt(Math.floor(Date.now() / 1000));
	const result: ExecutionResult<GetActiveTicketsQuery> = await execute(GetActiveTicketsDocument, { now: now.toString(), player: address });
	if (result.data) {
		return result.data.tickets.map((ticket) => {
			const round = ticket.round.round.toLowerCase() as Address;
			const player = address;
			return {
				round,
				player,
				token: Number(ticket.tokenId),
				tickets: decodeLines(ticket.lines.map((e) => ({ numbers: Number(e.numbers), symbol: Number(e.symbol) }))),
			};
		});
	}
	return [];
};
