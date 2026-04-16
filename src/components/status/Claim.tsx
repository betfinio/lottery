import { BetValue } from '@betfinio/components/shared';
import { Badge, Button } from '@betfinio/components/ui';
import { LoaderIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useBetClaimed, useBetPayout, useTicketPrice, useWinningLine } from '@/src/lib/query';
import { useClaimBet } from '@/src/lib/query/mutations';
import { EMPTY_TICKET, type IBet } from '@/src/lib/types';
import { calculateBetPrize } from '@/src/lib/utils';

function Claim({ ticket }: { ticket: IBet }) {
	const { data: isClaimed, isPending: isClaimedPending } = useBetClaimed(ticket.betAddress);
	const { data: payout = 0n } = useBetPayout(ticket.betAddress);
	const { mutate: claim, isPending: isClaiming } = useClaimBet();
	const { data: ticketPrice = 0n } = useTicketPrice();
	const { data: winningLine } = useWinningLine(ticket.roundId);

	const handleClaim = () => {
		claim({ betAddress: ticket.betAddress });
	};

	const calculatedPrize = useMemo(() => {
		return calculateBetPrize(winningLine ?? EMPTY_TICKET, ticket.tickets, ticketPrice);
	}, [winningLine, ticket.tickets, ticketPrice]);

	const winAmount = payout > 0n ? payout : calculatedPrize.prizeAmount;

	// Show claim UI for pending tickets in settled rounds (not yet claimed on-chain)
	if (ticket.status === 'pending' && winningLine && calculatedPrize.prizeAmount > 0n) {
		return (
			<PrizeToClaim prizeAmount={calculatedPrize.prizeAmount} handleClaim={handleClaim} isClaimed={false} isClaimedPending={false} isClaiming={isClaiming} />
		);
	}

	// Show claim UI when ticket is resolved and has a prize
	if (ticket.status === 'resolved' && winAmount > 0n) {
		return (
			<PrizeToClaim prizeAmount={winAmount} handleClaim={handleClaim} isClaimed={!!isClaimed} isClaimedPending={isClaimedPending} isClaiming={isClaiming} />
		);
	}

	// Show validate button for resolved tickets with no computed prize yet
	if (ticket.status === 'resolved' && winAmount === 0n && !isClaimed) {
		return (
			<div className={'flex flex-row items-center gap-2'} onClick={handleClaim}>
				<Badge className="bg-primary text-primary-foreground">{isClaiming ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Validate'}</Badge>
			</div>
		);
	}
}

export default Claim;

const PrizeToClaim = ({
	prizeAmount,
	handleClaim,
	isClaimed,
	isClaimedPending,
	isClaiming,
}: {
	prizeAmount: bigint;
	handleClaim: () => void;
	isClaimed: boolean;
	isClaimedPending: boolean;
	isClaiming: boolean;
}) => {
	return (
		<div className={'flex flex-row items-center gap-2'}>
			{prizeAmount > 0n && <BetValue className="text-sm" value={prizeAmount} withIcon iconClassName="w-3 h-3" />}
			{!isClaimed && !isClaimedPending && (
				<Button size="freeSize" shape="pill" onClick={handleClaim} className="w-16 h-5 justify-center">
					{isClaiming ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Claim'}
				</Button>
			)}
			{isClaimed && <Badge className="bg-muted/10 text-muted-foreground">Claimed</Badge>}
		</div>
	);
};
