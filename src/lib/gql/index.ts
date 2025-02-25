import {
	GetActiveRoundsDocument,
	type GetActiveRoundsQuery,
	GetOldRoundsDocument,
	type GetOldRoundsQuery,
	GetPlayerRoundsDocument,
	type GetPlayerRoundsQuery,
	GetPlayerTicketByRoundDocument,
	type GetPlayerTicketByRoundQuery,
	GetPlayerTicketsDocument,
	type GetPlayerTicketsQuery,
	GetRoundDetailsDocument,
	type GetRoundDetailsQuery,
	GetRoundJackpotsDocument,
	type GetRoundJackpotsQuery,
	GetTicketsDocument,
	type GetTicketsQuery,
	type Line,
	type Round,
	type RoundFragment,
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

export const fetchMyLinesSold = async (round: Address, player: Address): Promise<number> => {
	logger.start('fetching my lines sold');
	const result: ExecutionResult<GetPlayerTicketsQuery> = await execute(GetPlayerTicketsDocument, { round: round, player: player });
	logger.success('fetched my lines sold', result.data?.tickets);
	if (result.data) {
		return result.data.tickets.reduce((acc, ticket) => acc + Number(ticket.linesCount), 0);
	}
	return 0;
};

const populateRound = (round: RoundFragment): IRound => {
	return {
		address: round.round.toLowerCase() as Address,
		finish: Number(round.timestamp),
		ticketCount: Number(round.ticketsCount),
		linesCount: Number(round.linesCount),
		bank: BigInt(round.bank),
		ticketPrice: BigInt(round.ticketPrice),
		ticketClaimedCount: Number(round.ticketClaimedCount),
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

export const fetchRoundDetails = async (round: Address) => {
	const result: ExecutionResult<GetRoundDetailsQuery> = await execute(GetRoundDetailsDocument, { round: round });
	logger.success('fetched round details', result.data?.rounds);
	if (result.data) {
		return result.data.rounds.map(populateRound)[0];
	}
};

export const fetchRoundJackpots = async (round: Address) => {
	const result: ExecutionResult<GetRoundJackpotsQuery> = await execute(GetRoundJackpotsDocument, { round: round });
	return result.data;
};
