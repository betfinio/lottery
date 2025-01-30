import { useRoundStatus, useTicketClaimed, useTicketStatus } from '@/src/lib/query';
import { useClaimTicket } from '@/src/lib/query/mutations';
import type { IRoundTicket } from '@/src/lib/types';
import { Badge } from '@betfinio/components/ui';

function Refunded({ ticket }: { ticket: IRoundTicket }) {
	const { data: status } = useTicketStatus(ticket.betAddress);
	const { data: roundStatus } = useRoundStatus(ticket.round);
	const { data: isClaimed } = useTicketClaimed(ticket.betAddress);
	const { mutate: claimTicket } = useClaimTicket();

	const handleClaim = () => {
		claimTicket({
			ticket: ticket.betAddress,
		});
	};
	if ((status === 6n || roundStatus === 8) && !isClaimed) {
		return (
			<div className={'flex flex-row items-center gap-2'}>
				<Badge className="bg-muted/10 text-muted-foreground" onClick={handleClaim}>
					Refunded
				</Badge>
			</div>
		);
	}

	if (status === 1n && roundStatus === 7) {
		return <Badge className="bg-muted/10 text-muted-foreground">Waiting for refund</Badge>;
	}

	if (isClaimed && status === 6n) {
		return <Badge variant="destructive">Refunded</Badge>;
	}
}

export default Refunded;
