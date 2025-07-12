import { truncateEthAddress } from '@betfinio/abi';
import type { Address } from 'viem';
import { ETHSCAN } from '@/src/globals.ts';

function Round({ address }: { address: Address }) {
	const handleStopPropagation = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.stopPropagation();
	};

	return (
		<a
			onClick={handleStopPropagation}
			href={`${ETHSCAN}/address/${address}`}
			target={'_blank'}
			rel={'noreferrer'}
			className={'hover:text-bonus duration-100 transition-all'}
		>
			{truncateEthAddress(address)}
		</a>
	);
}
export default Round;
