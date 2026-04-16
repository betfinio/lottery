import { ZeroAddress } from '@betfinio/abi';
import { BetValue } from '@betfinio/components/shared';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { usePlayerBetsByRound } from '@/src/lib/query';

function MyLinesBank({ roundId }: { roundId: bigint }) {
	const { address = ZeroAddress } = useAccount();
	const { data: bets = [] } = usePlayerBetsByRound(roundId, address);
	const totalAmount = useMemo(() => bets.reduce((sum, bet) => sum + bet.amount, 0n), [bets]);
	return <BetValue value={totalAmount} withIcon />;
}

export default MyLinesBank;
