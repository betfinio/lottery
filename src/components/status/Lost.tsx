import { Badge, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';
import { useTranslation } from 'react-i18next';
import { useWinningLine } from '@/src/lib/query';
import { useClaimBet } from '@/src/lib/query/mutations';
import type { IBet } from '@/src/lib/types';
import { compareTickets } from '@/src/lib/utils';

function Lost({ ticket }: { ticket: IBet }) {
	const { t } = useTranslation('lottery');
	const { data: winningLine } = useWinningLine(ticket.roundId);
	const { mutate: claim } = useClaimBet();

	const handleClaim = () => {
		claim({
			betAddress: ticket.betAddress,
		});
	};

	const allTicketsCoef = winningLine ? ticket.tickets.map((t) => compareTickets(t, winningLine)).every((coef) => coef === 0) : false;
	const sumCoef = winningLine ? ticket.tickets.reduce((acc, t) => acc + compareTickets(t, winningLine), 0) : 0;

	// Resolved with no prize (lost, already validated on-chain)
	if (ticket.status === 'resolved' && (ticket.prize === null || ticket.prize === 0n) && winningLine && allTicketsCoef) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>
						<Badge variant="destructive">{t('lost')}</Badge>
					</TooltipTrigger>
					<TooltipContent>{t('thisStatusIsFinalAndValidatedByBlockchain')}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	// Pending but round is settled and lines don't match (predicted lost, not yet claimed)
	if (ticket.status === 'pending' && winningLine && sumCoef === 0 && allTicketsCoef) {
		return (
			<TooltipProvider>
				<Tooltip delayDuration={0}>
					<TooltipTrigger>
						<Badge className="bg-muted/10 text-muted-foreground hover:scale-105 transition-all flex flex-row gap-1" onClick={handleClaim}>
							{t('lost')}
						</Badge>
					</TooltipTrigger>
					<TooltipContent>{t('thisStatusIsNotYetValidatedByBlockchain')}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	// Waiting state
	if (ticket.status === 'pending') {
		return <Badge className="bg-muted/10 text-muted-foreground">{t('waiting')}</Badge>;
	}
}

export default Lost;
