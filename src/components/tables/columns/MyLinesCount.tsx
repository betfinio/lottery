import { ZeroAddress } from '@betfinio/abi';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { usePlayerBetsByRound } from '@/src/lib/query';
import Count from './Count';

function MyLinesCount({ roundId }: { roundId: bigint }) {
	const { address = ZeroAddress } = useAccount();
	const { data: bets = [] } = usePlayerBetsByRound(roundId, address);
	const totalLines = useMemo(() => bets.reduce((sum, bet) => sum + bet.tickets.length, 0), [bets]);
	return <Count count={totalLines} />;
}

export default MyLinesCount;
