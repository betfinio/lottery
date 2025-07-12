import { Badge, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';
import { HelpCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRoundStatus, useTicketStatus, useWinningLine } from '@/src/lib/query';
import { useClaimTicket } from '@/src/lib/query/mutations';
import { type IRoundTicket, RoundStatus } from '@/src/lib/types';
import { compareLines } from '@/src/lib/utils';

function Lost({ ticket }: { ticket: IRoundTicket }) {
	const { t } = useTranslation('lottery');
	const { data: status } = useTicketStatus(ticket.betAddress);
	const { data: roundStatus } = useRoundStatus(ticket.round);
	const { data: winningLine } = useWinningLine(ticket.round);
	const { mutate: claim } = useClaimTicket();

	const handleClaim = () => {
		claim({
			ticket: ticket.betAddress,
		});
	};

	const allLinesCoef = winningLine ? ticket.lines.map((line) => compareLines(line, winningLine, ticket.lines.length >= 3)).every((coef) => coef === 0) : false;

	const sumCoef = winningLine ? ticket.lines.reduce((acc, line) => acc + compareLines(line, winningLine, ticket.lines.length >= 3), 0) : 0;
	// if claimed as lost
	if (status === 3n) {
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
	// if round is over and not claimed
	if (roundStatus === RoundStatus.CLAIMING && winningLine && sumCoef === 0 && status === 1n && allLinesCoef) {
		return (
			<TooltipProvider>
				<Tooltip delayDuration={0}>
					<TooltipTrigger>
						<Badge className="bg-muted/10 text-muted-foreground hover:scale-105 transition-all flex flex-row gap-1" onClick={handleClaim}>
							{t('lost')}
							<HelpCircleIcon className="w-3 h-3" />
						</Badge>
					</TooltipTrigger>
					<TooltipContent>{t('thisStatusIsNotYetValidatedByBlockchain')}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	if ((status === 1n && roundStatus === RoundStatus.WAITING_FOR_REQUEST) || roundStatus === RoundStatus.DONE) {
		return <Badge className="bg-muted/10 text-muted-foreground">{t('waiting')}</Badge>;
	}
}

export default Lost;
