// @ts-ignore
import Jackpot from '@/src/assets/jackpot.svg?react';
import { MAX_SHARES } from '@/src/globals.ts';
import { useBetsCount, useRoundFinish, useTicketPrice, useTicketsCount } from '@/src/lib/query';
import { type TimeDiff, getDiff } from '@/src/lib/utils';
import { truncateEthAddress } from '@betfinio/abi';
import { Certik, Polygon } from '@betfinio/components/icons';
import { BetValue } from '@betfinio/components/shared';
import { HexagonIcon, TicketIcon, UserIcon } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';
import type { Address } from 'viem';

const CurrentRound: FC<{ round: Address }> = ({ round }) => {
	const { data: finish = 0 } = useRoundFinish(round);
	const { data: ticketPrice = 0n } = useTicketPrice(round);
	const { data: ticketsCount = 0 } = useTicketsCount(round);
	const { data: betsCount = 0 } = useBetsCount(round);
	const [diff, setDiff] = useState<TimeDiff>({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	const updateDiff = () => {
		const now = Math.floor(Date.now() / 1000);
		setDiff(getDiff(now, finish));
	};

	useEffect(() => {
		updateDiff();
		const interval = setInterval(() => {
			updateDiff();
		}, 1000);
		return () => clearInterval(interval);
	}, [finish]);

	return (
		<div className={'p-3 flex flex-col gap-4 justify-between h-full'}>
			<div className={'flex flex-col gap-3'}>
				<div className={'w-full text-center text-purple-box'}>Draw {truncateEthAddress(round).toLowerCase()}</div>
				<div className={'flex flex-row items-center justify-center text-muted-foreground text-sm gap-1'}>
					<div className={'aspect-square w-10 rounded-lg bg-secondary flex items-center justify-center'}>{diff.days}d</div> :
					<div className={'aspect-square w-10 rounded-lg bg-secondary flex items-center justify-center'}>{diff.hours}h</div> :
					<div className={'aspect-square w-10 rounded-lg bg-secondary flex items-center justify-center'}>{diff.minutes}m</div> :
					<div className={'aspect-square w-10 rounded-lg bg-secondary flex items-center justify-center'}>{diff.seconds}s</div>
				</div>
			</div>
			<div className={'relative flex items-center justify-center'}>
				<div className={'scale-110'}>
					<Jackpot />
				</div>
				<div className={'absolute top-24 text-2xl text-secondary-foreground '}>
					<BetValue value={ticketPrice * BigInt(MAX_SHARES)} withIcon withMillify={false} iconClassName={'w-5 h-5'} />
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
						{ticketsCount} <TicketIcon className={'w-4 h-4'} />
					</div>
				</div>
				<div className={'bg-secondary text-secondary-foreground rounded-xl flex items-center justify-between p-4 py-2 flex-col'}>
					<span className={'text-muted-foreground text-sm'}>Players</span>
					<div className={'flex flex-row items-center gap-1'}>
						{betsCount} <UserIcon className={'w-4 h-4'} />
					</div>
				</div>
				<div className={'bg-secondary text-secondary-foreground rounded-xl flex items-center justify-between p-4 py-2 flex-col'}>
					<span className={'text-muted-foreground text-sm'}>Volume</span>
					<div className={'flex flex-row items-center gap-1'}>
						<BetValue value={BigInt(ticketsCount) * ticketPrice} withIcon />
					</div>
				</div>
			</div>
		</div>
	);
};

export default CurrentRound;
