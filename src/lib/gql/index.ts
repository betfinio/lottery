import {
	GetActiveRoundsDocument,
	type GetActiveRoundsQuery,
	GetOldRoundsDocument,
	type GetOldRoundsQuery,
	GetPlayerRoundsDocument,
	type GetPlayerRoundsQuery,
	GetPlayerTicketByRoundDocument,
	type GetPlayerTicketByRoundQuery,
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
		return result.data.rounds.map(populateRound);
	}
	return [];
};

export const fetchOldRounds = async (): Promise<IRound[]> => {
	logger.start('fetching old rounds');
	const now = BigInt(Math.floor(Date.now() / 1000));
	const result: ExecutionResult<GetOldRoundsQuery> = await execute(GetOldRoundsDocument, { now: now.toString() });
	logger.success('fetched old rounds', result.data?.rounds);
	if (result.data?.rounds) {
		return result.data.rounds.map(populateRound);
	}
	return [];
};
export const fetchActiveTickets = async (address?: Address): Promise<IRoundTicket[]> => {
	if (!address || address === ZeroAddress) {
		return [];
	}
	logger.start('fetching tickets');
	const now = BigInt(Math.floor(Date.now() / 1000));
	const result: ExecutionResult<GetTicketsQuery> = await execute(GetTicketsDocument, { now: now.toString(), player: address });
	logger.success('fetched tickets', result.data?.active, result.data?.old);
	if (result.data) {
		return result.data.active.map(populateTickets);
	}
	return [];
};

export const fetchPlayerRounds = async (address?: Address): Promise<IRound[]> => {
	if (!address || address === ZeroAddress) {
		return [];
	}
	logger.start('fetching player rounds');
	const now = BigInt(Math.floor(Date.now() / 1000));
	const result: ExecutionResult<GetPlayerRoundsQuery> = await execute(GetPlayerRoundsDocument, { now: now.toString(), player: address });
	logger.success('fetched player rounds', result.data?.rounds);
	if (result.data) {
		return result.data.rounds.map(populateRound);
	}
	return [];
};

export const fetchOldTickets = async (address?: Address): Promise<IRoundTicket[]> => {
	if (!address || address === ZeroAddress) {
		return [];
	}
	logger.start('fetching tickets');
	const now = BigInt(Math.floor(Date.now() / 1000));
	const result: ExecutionResult<GetTicketsQuery> = await execute(GetTicketsDocument, { now: now.toString(), player: address });
	logger.success('fetched tickets', result.data?.active, result.data?.old);
	if (result.data) {
		return result.data.old.map(populateTickets);
	}
	return [];
};

const populateRound = (round: Pick<Round, 'id' | 'round' | 'timestamp' | 'bank' | 'blockNumber' | 'ticketPrice' | 'ticketsCount' | 'linesCount'>): IRound => {
	return {
		address: round.round.toLowerCase() as Address,
		finish: Number(round.timestamp),
		ticketCount: Number(round.ticketsCount),
		linesCount: Number(round.linesCount),
		bank: BigInt(round.bank),
		ticketPrice: BigInt(round.ticketPrice),
	};
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

export const fetchRoundTicketsByPlayer = async (round: Address, address: Address): Promise<IRoundTicket[]> => {
	const result: ExecutionResult<GetPlayerTicketByRoundQuery> = await execute(GetPlayerTicketByRoundDocument, { round: round, player: address });
	logger.success('fetched tickets', result.data?.tickets);
	if (result.data) {
		return result.data.tickets.map(populateTickets);
	}
	return [];
};
