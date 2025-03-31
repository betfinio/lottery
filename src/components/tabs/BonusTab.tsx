import {
	useBoughtLinesCount,
	useExchangeRate,
	useFreeLinesCount,
	useLostTicketsClaimed,
	useLostTicketsToClaim,
	useUnclaimedTickets,
	useUsedFreeLinesCount,
} from '@/src/lib/query';
import { useClaimUnclaimedTickets } from '@/src/lib/query/mutations';
import { ZeroAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { Badge, Button, Progress, Separator } from '@betfinio/components/ui';
import { TicketsIcon } from 'lucide-react';
import { useAccount } from 'wagmi';
import Ticket from '../icons/Ticket';

function BonusTab() {
	const { address = ZeroAddress } = useAccount();
	const { data: freeLinesCount = 0n } = useFreeLinesCount(address);
	const { data: usedFreeLinesCount = 0n } = useUsedFreeLinesCount(address);
	return (
		<div className="flex flex-col items-center h-full">
			<div className="text-lg font-semibold">Free lines challenges</div>
			<div className="flex-grow w-full py-2 gap-2 flex flex-col">
				<FreeLinesChallenge />
				<BuyTicketsChallenge />
			</div>
			<Separator />
			<div className="grid grid-cols-2 gap-2 w-full py-2">
				<div className="bg-secondary rounded-xl p-2 flex flex-col items-center justify-center">
					<div className="text-sm text-muted-foreground">Total free lines</div>
					<div className="text-xl font-semibold flex flex-row items-center gap-1 text-primary">
						{Number(freeLinesCount + usedFreeLinesCount)}
						<Ticket className="w-4 h-4" />
					</div>
				</div>
				<div className="bg-secondary rounded-xl p-2 flex flex-col items-center justify-center">
					<div className="text-sm text-muted-foreground">Active free lines</div>
					<div className="text-xl font-semibold flex flex-row items-center gap-1 text-success">
						{Number(freeLinesCount)}
						<Ticket className="w-4 h-4 text-success" />
					</div>
				</div>
			</div>
		</div>
	);
}

function FreeLinesChallenge() {
	const { address = ZeroAddress } = useAccount();
	const { data: lostTicketsToClaim = 0n } = useLostTicketsToClaim();
	const { data: lostTicketsClaimed = 0n } = useLostTicketsClaimed(address);
	const { data: unclaimedTickets = [] } = useUnclaimedTickets();
	const { mutate: claimUnclaimedTickets } = useClaimUnclaimedTickets();
	const toClaim = Math.min(100, unclaimedTickets.length);
	const handleClaim = () => {
		claimUnclaimedTickets({ tickets: unclaimedTickets.slice(0, toClaim) });
	};
	return (
		<div className="bg-secondary rounded-xl p-4 flex flex-col items-center justify-center w-full gap-2">
			<div className="flex flex-row items-center justify-start gap-2 w-full">
				<TicketsIcon className="w-10 h-10 text-primary shrink-0 " />
				<div>
					Claim <span className="text-primary">{Number(lostTicketsToClaim)} tickets</span> of other players and get{' '}
					<span className="text-primary">1 free line</span>
				</div>
			</div>
			<div className="flex flex-row justify-between items-end w-full text-muted-foreground gap-1">
				{toClaim > 0 ? (
					<Button size="freeSize" className={cn('px-2')} onClick={handleClaim}>
						Claim {toClaim} tickets
					</Button>
				) : (
					<Badge className="bg-muted text-muted-foreground">All claimed</Badge>
				)}
				<div>
					<span className="text-primary">{Number(lostTicketsClaimed)}</span> / {Number(lostTicketsToClaim)}
				</div>
			</div>
			<div className="w-full">
				<Progress value={(Number(lostTicketsClaimed) / Number(lostTicketsToClaim)) * 100} className="bg-border" />
			</div>
		</div>
	);
}

function BuyTicketsChallenge() {
	const { address = ZeroAddress } = useAccount();
	const { data: boughtLinesCount = 0n } = useBoughtLinesCount(address);
	const { data: exchangeRate = 50n } = useExchangeRate();
	return (
		<div className="bg-secondary rounded-xl p-4 flex flex-col items-center justify-center w-full gap-2">
			<div className="flex flex-row items-center justify-start gap-2 w-full">
				<TicketsIcon className="w-10 h-10 text-primary shrink-0 " />
				<div>
					Buy <span className="text-primary">{Number(exchangeRate)} lines</span> and get <span className="text-primary">1 free line</span>
				</div>
			</div>
			<div className="flex flex-row justify-end items-end w-full text-muted-foreground gap-1">
				<span className="text-primary">{Number(boughtLinesCount)}</span> / {Number(exchangeRate)}
			</div>
			<div className="w-full">
				<Progress value={(Number(boughtLinesCount) / Number(exchangeRate)) * 100} className="bg-border" />
			</div>
		</div>
	);
}

export default BonusTab;
