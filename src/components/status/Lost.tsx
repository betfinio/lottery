import { useRoundStatus, useTicketClaimed, useTicketStatus, useTicketWinAmount, useWinningLine } from '@/src/lib/query';
import { useClaimTicket } from '@/src/lib/query/mutations';
import { type IRoundTicket, RoundStatus } from '@/src/lib/types';
import { compareLines } from '@/src/lib/utils';
import { Badge, Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';

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
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>
						<Badge variant="destructive">Lost</Badge>
					</TooltipTrigger>
					<TooltipContent asChild>This status is final and validated by blockchain</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}
	// if round is over and not claimed
	if (roundStatus === RoundStatus.CLAIMING && winningLine && coef === 0 && status === 1n && allLinesCoef) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>
						<Badge className="bg-muted/10 text-muted-foreground" onClick={handleClaim}>
							Lost
						</Badge>
					</TooltipTrigger>
					<TooltipContent>
						This status is not yet validated by blockchain. Click on the status and sign the transaction to validate the status by blockchain
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	if ((status === 1n && roundStatus === RoundStatus.WAITING_FOR_REQUEST) || roundStatus === RoundStatus.DONE) {
		return <Badge className="bg-muted/10 text-muted-foreground">Waiting</Badge>;
	}
}

export default Lost;
