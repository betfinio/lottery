import { ZeroAddress } from '@betfinio/abi';
import { BetValue } from '@betfinio/components/shared';
import { Badge, Button } from '@betfinio/components/ui';
import { LoaderIcon } from 'lucide-react';
import type { Address } from 'viem';
import { useTicketClaimed, useTicketResult, useTicketRound, useTicketStatus, useTicketWinAmount, useWinningLine } from '../lib/query';
import { useClaimTicket } from '../lib/query/mutations';

function TicketStatus({ ticket }: { ticket: Address }) {
	const { data: status } = useTicketStatus(ticket);
	const { data: round = ZeroAddress } = useTicketRound(ticket);
	const { data: result = [0n, false], isPending } = useTicketResult(ticket, round);
	const { data: isClaimed, isPending: isClaimedPending } = useTicketClaimed(ticket);
	const { data: claimedAmount = 0n } = useTicketWinAmount(ticket);
	const { mutate: claim, isPending: isClaiming } = useClaimTicket();

	const handleClaim = () => {
		claim({ ticket });
	};

	if (status === 6n) {
		return <Badge className="bg-muted/10 text-muted-foreground">Refunded</Badge>;
	}

	if (!isPending && result[0] > 0n) {
		return (
			<div className={'flex flex-row items-center gap-2'}>
				{claimedAmount > 0n && <BetValue className="text-sm" value={claimedAmount} withIcon iconClassName="w-3 h-3" />}
				{!isClaimed && !isClaimedPending && (
					<Badge onClick={handleClaim} className="w-12 justify-center">
						{isClaiming ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Claim'}
					</Badge>
				)}
				{isClaimed && <Badge className="bg-muted/10 text-muted-foreground">Claimed</Badge>}
				<Badge className="bg-green-500 text-white">Won</Badge>
			</div>
		);
	}

	if (!isPending && result[0] === 0n && status !== 1n) {
		return <Badge variant="destructive">Lost</Badge>;
	}

	if (status === 1n) {
		return <Badge className="bg-muted/10 text-muted-foreground">Waiting</Badge>;
	}
	return null;
}

export default TicketStatus;
