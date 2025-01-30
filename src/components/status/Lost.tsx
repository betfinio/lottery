import { useRoundStatus, useTicketClaimed, useTicketStatus, useTicketWinAmount, useWinningLine } from '@/src/lib/query';
import { useClaimTicket } from '@/src/lib/query/mutations';
import type { IRoundTicket } from '@/src/lib/types';
import { compareLines } from '@/src/lib/utils';
import { Badge, Button } from '@betfinio/components/ui';

function Lost({ ticket }: { ticket: IRoundTicket }) {
	const { data: status } = useTicketStatus(ticket.betAddress);
	const { data: roundStatus } = useRoundStatus(ticket.round);
	const { data: winningLine } = useWinningLine(ticket.round);
	const { mutate: claim } = useClaimTicket();

	const handleClaim = () => {
		claim({
			ticket: ticket.betAddress,
		});
	};

	const coef = winningLine ? compareLines(ticket.lines[0], winningLine) : -1;
	const allLinesCoef = winningLine ? ticket.lines.map((line) => compareLines(line, winningLine)).every((coef) => coef === 0) : false;
	// if claimed as lost
	if (status === 3n) {
		return <Badge variant="destructive">Lost</Badge>;
	}
	// if round is over and not claimed
	if (roundStatus === 4 && winningLine && coef === 0 && status === 1n && allLinesCoef) {
		return (
			<Badge className="bg-muted/10 text-muted-foreground" onClick={handleClaim}>
				Lost
			</Badge>
		);
	}

	if (status === 1n && roundStatus === 5) {
		return <Badge className="bg-muted/10 text-muted-foreground">Waiting</Badge>;
	}
}

export default Lost;
