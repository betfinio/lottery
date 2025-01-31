import { ZeroAddress, truncateEthAddress } from '@betfinio/abi';
import { BetValue } from '@betfinio/components/shared';
import { DateTime } from 'luxon';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';
import { useLinesCount, useRoundFinish, useRoundTicketsByPlayer, useTicketPrice } from '../lib/query';
import TicketIcon from './icons/ticket';
import TicketsList from './tabs/TicketsList';

function RoundModalContent({ round }: { round: Address }) {
	const { data: finished } = useRoundFinish(round);
	return (
		<div className="w-full h-full flex flex-col items-center p-2 gap-2 md:p-3 lg:p-4 lg:gap-4 ">
			<div className="font-semibold">Round: {truncateEthAddress(round)}</div>
			<div className="text-muted-foreground">{DateTime.fromSeconds(Number(finished)).toFormat('DD, T')}</div>
			<Cards round={round} />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 w-full h-full">
				<JackpotInfo round={round} />
				<MyTickets round={round} />
			</div>
		</div>
	);
}

function Cards({ round }: { round: Address }) {
	const { data: lines = 0n } = useLinesCount(round);
	const { data: price = 0n } = useTicketPrice(round);
	const bank = lines * price;
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 w-full gap-2 md:gap-4">
			<div className="border border-border rounded-lg p-2 py-6 flex flex-row items-center justify-center gap-4">
				<TicketIcon className="w-16 h-16" />
				<div className="flex flex-col items-center">
					<BetValue className="text-xl" value={bank} withIcon />
					<div className="">{Number(lines)} lines</div>
					<div className="text-muted-foreground">Total bets</div>
				</div>
			</div>
			<div className="border border-border rounded-lg p-2 py-6 flex flex-row items-center justify-center gap-4">
				<TicketIcon className="w-16 h-16" />
				<div className="flex flex-col items-center">
					<BetValue className="text-xl" value={bank} withIcon />
					<div className="">{Number(lines)} lines</div>
					<div className="text-muted-foreground">Total bets</div>
				</div>
			</div>
		</div>
	);
}

function JackpotInfo({ round }: { round: Address }) {
	return <div>jackpot</div>;
}
function MyTickets({ round }: { round: Address }) {
	const { data: finish } = useRoundFinish(round);
	const { address = ZeroAddress } = useAccount();
	const { data: tickets = [] } = useRoundTicketsByPlayer(round, address);
	const now = DateTime.now().toSeconds();
	const isFinished = finish ? finish < now : true;
	return (
		<div className="border border-border rounded-lg p-2 flex flex-col items-center justify-center gap-4 w-full h-[530px] pb-10 relative">
			<div>My tickets ({tickets.length})</div>
			<TicketsList tickets={tickets} old={isFinished} />
		</div>
	);
}

export default RoundModalContent;
