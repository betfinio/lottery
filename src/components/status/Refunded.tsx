import { Badge } from '@betfinio/components/ui';
import { useTranslation } from 'react-i18next';
import { useBetClaimed } from '@/src/lib/query';
import { useClaimBet } from '@/src/lib/query/mutations';
import type { IBet } from '@/src/lib/types';

function Refunded({ ticket }: { ticket: IBet }) {
	const { t } = useTranslation('lottery');
	const { data: isClaimed } = useBetClaimed(ticket.betAddress);
	const { mutate: claimBet } = useClaimBet();

	const handleClaim = () => {
		claimBet({
			betAddress: ticket.betAddress,
		});
	};

	// Refunded but not yet claimed
	if (ticket.status === 'refunded' && !isClaimed) {
		return (
			<div className={'flex flex-row items-center gap-2'}>
				<Badge className="bg-muted/10 text-muted-foreground" onClick={handleClaim}>
					Refunded
				</Badge>
			</div>
		);
	}

	// Refunded and claimed
	if (ticket.status === 'refunded' && isClaimed) {
		return <Badge variant="destructive">{t('refunded')}</Badge>;
	}
}

export default Refunded;
