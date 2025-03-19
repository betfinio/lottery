import { useRoundStatus, useTicketClaimed, useTicketPrice, useTicketResult, useTicketWinAmount } from '@/src/lib/query';
import { useClaimTicket } from '@/src/lib/query/mutations';
import { type IRoundTicket, RoundStatus } from '@/src/lib/types';
import { BetValue } from '@betfinio/components/shared';
import { Badge, Button } from '@betfinio/components/ui';
import { LoaderIcon } from 'lucide-react';

function Claim({ ticket }: { ticket: IRoundTicket }) {
	const { data: result = [0n, false], isPending } = useTicketResult(ticket.betAddress, ticket.round);
	const { data: claimedAmount = 0n } = useTicketWinAmount(ticket.betAddress);
	const { data: isClaimed, isPending: isClaimedPending } = useTicketClaimed(ticket.betAddress);
	const { mutate: claim, isPending: isClaiming } = useClaimTicket();
	const { data: roundStatus } = useRoundStatus(ticket.round);
	const { data: ticketPrice = 0n } = useTicketPrice(ticket.round);

	const handleClaim = () => {
		claim({ ticket: ticket.betAddress });
	};

	const predictedWin = result[0] * ticketPrice;
	const winAmount = claimedAmount || predictedWin;

	if (!isPending && winAmount > 0n && roundStatus === RoundStatus.CLAIMING) {
		return (
			<div className={'flex flex-row items-center gap-2'}>
				{winAmount > 0n && <BetValue className="text-sm" value={winAmount} withIcon iconClassName="w-3 h-3" />}
				{!isClaimed && !isClaimedPending && (
					<Button size="freeSize" shape="pill" onClick={handleClaim} className="w-16 h-5 justify-center">
						{isClaiming ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Claim'}
					</Button>
				)}
				{isClaimed && <Badge className="bg-muted/10 text-muted-foreground">Claimed</Badge>}
			</div>
		);
	}

	if (!isPending && result[0] === 0n && roundStatus === RoundStatus.CLAIMING) {
		return (
			<div className={'flex flex-row items-center gap-2'}>
				<Badge className="bg-muted/10 text-muted-foreground">Validate</Badge>
			</div>
		);
	}
}

export default Claim;
