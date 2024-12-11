import { GetActiveRoundsDocument, type GetActiveRoundsQuery, execute } from '@/.graphclient';
import logger from '@/src/config/logger';
import type { IRound } from '@/src/lib/types.ts';
import type { ExecutionResult } from 'graphql/execution';
import type { Address } from 'viem';

export const fetchActiveRounds = async (): Promise<IRound[]> => {
	logger.start('fetching active rounds');
	const now = BigInt(Math.floor(Date.now() / 1000));
	const result: ExecutionResult<GetActiveRoundsQuery> = await execute(GetActiveRoundsDocument, { now: now.toString() });
	console.log(result.data);
	if (result.data?.rounds) {
		logger.success('fetching active rounds');
		return result.data.rounds.map((round) => ({ address: round.round as Address, finish: Number(round.timestamp) }) as IRound);
	}
	console.log(result.errors);
	return [];
};
