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
import { Badge, Button, Progress, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator } from '@betfinio/components/ui';
import { StarIcon, TicketsIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import Ticket from '../icons/Ticket';

function BonusTab() {
	const { address = ZeroAddress } = useAccount();
	const { data: freeLinesCount = 0n } = useFreeLinesCount(address);
	const { data: usedFreeLinesCount = 0n } = useUsedFreeLinesCount(address);
	return (
		<div className="flex flex-col items-center h-full">
			<div className="text-lg font-semibold">Free lines challenges</div>
			<div className="grow w-full py-2 gap-2 flex flex-col">
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
const claimOptions = [1, 5, 10, 25, 50, 100, 200];
function FreeLinesChallenge() {
	const { address = ZeroAddress } = useAccount();
	const { data: lostTicketsToClaim = 0n } = useLostTicketsToClaim();
	const { data: lostTicketsClaimed = 0n } = useLostTicketsClaimed(address);
	const { data: unclaimedTickets = [] } = useUnclaimedTickets();
	const { mutate: claimUnclaimedTickets } = useClaimUnclaimedTickets();

	const maxAmountToClaim = 200;
	const minAmountToClaim = 1;

	const [toClaim, setToClaim] = useState(minAmountToClaim);
	const [availableToClaim, setAvailableToClaim] = useState(0);

	useEffect(() => {
		setAvailableToClaim(Math.max(0, unclaimedTickets.length));
	}, [unclaimedTickets.length]);

	const sortedOptions = useMemo(() => {
		return Array.from(
			new Set(
				[minAmountToClaim, maxAmountToClaim, availableToClaim, ...claimOptions]
					.filter((opt) => opt <= availableToClaim && opt <= maxAmountToClaim)
					.sort((a, b) => a - b),
			),
		);
	}, [availableToClaim]);

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
			<div
				className={cn(
					'flex flex-row justify-between items-center w-full text-muted-foreground gap-1',
					availableToClaim > 0 ? 'justify-between' : 'justify-end',
				)}
			>
				{availableToClaim > 0 && (
					<div className="flex flex-row gap-1">
						<Select value={toClaim.toString()} onValueChange={(value) => setToClaim(Number(value))}>
							<SelectTrigger className="w-24">
								<SelectValue placeholder="Select Tariff" />
							</SelectTrigger>
							<SelectContent className="min-w-24">
								{sortedOptions?.map((opt) => (
									<SelectItem key={opt} value={opt.toString()}>
										<span>{opt}</span>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button size="freeSize" className={cn('px-2 border')} onClick={handleClaim} disabled={toClaim > availableToClaim}>
							Claim {toClaim} tickets
						</Button>
					</div>
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

export function BonusTabIcon() {
	const { address = ZeroAddress } = useAccount();
	const { data: freeLinesCount = 0n } = useFreeLinesCount(address);
	if (freeLinesCount > 0) {
		return (
			<div className={'flex flex-row items-center gap-1 relative'}>
				{/* <Ticket className={'w-4 h-4 text-success'} /> */}
				<Badge variant="destructive" className={'text-xs min-w-4.5 justify-center rounded-full px-1'}>
					{Number(freeLinesCount) > 9 ? '9+' : Number(freeLinesCount)}
				</Badge>
			</div>
		);
	}
	return <StarIcon className={'w-4 h-4'} />;
}

export default BonusTab;
