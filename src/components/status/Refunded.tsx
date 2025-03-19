import { useRoundStatus, useTicketClaimed, useTicketStatus } from '@/src/lib/query';
import { useClaimTicket } from '@/src/lib/query/mutations';
import { type IRoundTicket, RoundStatus } from '@/src/lib/types';
import { Badge } from '@betfinio/components/ui';
import { useTranslation } from 'react-i18next';

function Refunded({ ticket }: { ticket: IRoundTicket }) {
	const { t } = useTranslation('lottery');
	const { data: status } = useTicketStatus(ticket.betAddress);
	const { data: roundStatus } = useRoundStatus(ticket.round);
	const { data: isClaimed } = useTicketClaimed(ticket.betAddress);
	const { mutate: claimTicket } = useClaimTicket();

	const handleClaim = () => {
		claimTicket({
			ticket: ticket.betAddress,
		});
	};
	if ((status === 6n || roundStatus === RoundStatus.REFUNDING) && !isClaimed) {
		return (
			<div className={'flex flex-row items-center gap-2'}>
				<Badge className="bg-muted/10 text-muted-foreground" onClick={handleClaim}>
					Refunded
				</Badge>
			</div>
		);
	}

	if (status === 1n && roundStatus === RoundStatus.READY_FOR_REFUND) {
		return <Badge className="bg-muted/10 text-muted-foreground">{t('waitingForRefund')}</Badge>;
	}

	if (isClaimed && status === 6n) {
		return <Badge variant="destructive">{t('refunded')}</Badge>;
	}
}

export default Refunded;
