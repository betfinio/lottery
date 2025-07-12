import { ZeroAddress } from '@betfinio/abi';
import { BetValue } from '@betfinio/components/shared';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';
import { useMyLinesSold } from '@/src/lib/query';

function MyLinesBank({ round, ticketPrice }: { round: Address; ticketPrice: bigint }) {
	const { address = ZeroAddress } = useAccount();
	const { data = 0 } = useMyLinesSold(round, address);
	return <BetValue value={(ticketPrice ?? 0n) * BigInt(data)} withIcon />;
}

export default MyLinesBank;
