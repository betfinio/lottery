import { useMyLinesSold } from '@/src/lib/query';
import { ZeroAddress } from '@betfinio/abi';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';
import Count from './Count';

function MyLinesCount({ round }: { round: Address }) {
	const { address = ZeroAddress } = useAccount();
	const { data = 0 } = useMyLinesSold(round, address);
	return <Count count={data} />;
}

export default MyLinesCount;
