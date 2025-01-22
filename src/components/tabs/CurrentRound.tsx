// @ts-ignore
import Jackpot from '@/src/assets/jackpot.svg?react';
import Countdown from '@/src/components/Countdown.tsx';
import { MAX_SHARES } from '@/src/globals.ts';
import { useRoundFinish, useRoundStatus } from '@/src/lib/query';
import type { IRound } from '@/src/lib/types.ts';
import { truncateEthAddress } from '@betfinio/abi';
import { Certik, Polygon } from '@betfinio/components/icons';
import { BetValue } from '@betfinio/components/shared';
import { HexagonIcon, TicketIcon, UserIcon } from 'lucide-react';
import type { FC } from 'react';

const CurrentRound: FC<{ round: IRound }> = ({ round }) => {
	console.log(round);
	const { data: finish = 0 } = useRoundFinish(round.address);
	const { data: status } = useRoundStatus(round.address);

	const renderStatus = () => {
		if (status === 1) {
			return <Countdown finish={finish} />;
		}
	};

	return (
		<div className={'p-3 flex flex-col gap-4 justify-between h-full'}>
			<div className={'flex flex-col gap-3'}>
				<div className={'w-full text-center text-purple-box'}>Next Draw {truncateEthAddress(round.address).toLowerCase()}</div>
				{renderStatus()}
			</div>
			<div className={'relative flex items-center justify-center'}>
				<div className={'scale-110'}>
					<Jackpot />
				</div>
				<div className={'absolute top-24 text-2xl text-secondary-foreground '}>
					<BetValue value={round.ticketPrice * BigInt(MAX_SHARES)} withIcon withMillify={false} iconClassName={'w-5 h-5'} />
				</div>
			</div>
			<div className={'w-full grid grid-cols-3 text-muted-foreground'}>
				<div className={'flex flex-row gap-1 items-center text-sm underline underline-offset-4 justify-center'}>
					Open Source <Polygon className={'w-6 h-6 text-purple-700'} />
				</div>
				<div className={'flex flex-row gap-1 items-center text-sm underline underline-offset-4 justify-center'}>
					Powered by <HexagonIcon className={'w-6 h-6 text-blue-400 stroke-[4px]'} />
				</div>
				<div className={'flex flex-row gap-1 items-center text-sm underline underline-offset-4 justify-center'}>
					Audited by <Certik className={'w-6 h-6 text-foreground'} />
				</div>
			</div>
			<div className={'grid grid-cols-3 gap-3'}>
				<div className={'bg-secondary text-secondary-foreground rounded-xl flex items-center justify-between p-4 py-2 flex-col'}>
					<span className={'text-muted-foreground text-sm'}>Tickets</span>
					<div className={'flex flex-row items-center gap-1'}>
						{round.linesCount} <TicketIcon className={'w-4 h-4'} />
					</div>
				</div>
				<div className={'bg-secondary text-secondary-foreground rounded-xl flex items-center justify-between p-4 py-2 flex-col'}>
					<span className={'text-muted-foreground text-sm'}>Players</span>
					<div className={'flex flex-row items-center gap-1'}>
						{round.ticketCount} <UserIcon className={'w-4 h-4'} />
					</div>
				</div>
				<div className={'bg-secondary text-secondary-foreground rounded-xl flex items-center justify-between p-4 py-2 flex-col'}>
					<span className={'text-muted-foreground text-sm'}>Volume</span>
					<div className={'flex flex-row items-center gap-1'}>
						<BetValue value={BigInt(round.bank)} withIcon />
					</div>
				</div>
			</div>
		</div>
	);
};

export default CurrentRound;
