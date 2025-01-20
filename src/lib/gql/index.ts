import {
	GetActiveRoundsDocument,
	type GetActiveRoundsQuery,
	GetTicketsDocument,
	type GetTicketsQuery,
	type Line,
	type Round,
	type Ticket,
	execute,
} from '@/.graphclient';
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
	logger.success('fetched active rounds', result.data?.rounds);
	if (result.data?.rounds) {
		return result.data.rounds.map((round) => ({ address: round.round.toLowerCase() as Address, finish: Number(round.timestamp) }) as IRound);
	}
	return [];
};

export const fetchTickets = async (address?: Address): Promise<{ active: IRoundTicket[]; old: IRoundTicket[] }> => {
	if (!address || address === ZeroAddress) {
		return { active: [], old: [] };
	}
	logger.start('fetching tickets');
	const now = BigInt(Math.floor(Date.now() / 1000));
	const result: ExecutionResult<GetTicketsQuery> = await execute(GetTicketsDocument, { now: now.toString(), player: address });
	if (result.data) {
		return { active: result.data.active.map(populateTickets), old: result.data.old.map(populateTickets) };
	}
	return { active: [], old: [] };
};

const populateTickets = (
	ticket: Pick<Ticket, 'id' | 'owner' | 'tokenId' | 'betAddress' | 'linesCount' | 'created' | 'updated' | 'amount' | 'symbolUnlocked'> & {
		round: Pick<Round, 'id' | 'round' | 'timestamp' | 'blockNumber'>;
		lines: Array<Pick<Line, 'id' | 'numbers' | 'symbol'>>;
	},
): IRoundTicket => {
	const round = ticket.round.round.toLowerCase() as Address;
	const player = ticket.owner as Address;
	return {
		round,
		player,
		betAddress: ticket.betAddress.toLowerCase() as Address,
		token: Number(ticket.tokenId),
		lines: decodeLines(ticket.lines.map((e) => ({ numbers: Number(e.numbers), symbol: Number(e.symbol) }))),
	};
};
