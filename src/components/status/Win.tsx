import { useRoundStatus, useTicketClaimed, useTicketResult, useTicketWinAmount } from '@/src/lib/query';
import { useClaimTicket } from '@/src/lib/query/mutations';
import { type IRoundTicket, RoundStatus } from '@/src/lib/types';
import { BetValue } from '@betfinio/components/shared';
import { Badge } from '@betfinio/components/ui';
import { LoaderIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function Win({ ticket }: { ticket: IRoundTicket }) {
	const { t } = useTranslation('lottery');
	const { data: result = [0n, false], isPending } = useTicketResult(ticket.betAddress, ticket.round);
	const { data: claimedAmount = 0n } = useTicketWinAmount(ticket.betAddress);
	const { data: isClaimed, isPending: isClaimedPending } = useTicketClaimed(ticket.betAddress);
	const { mutate: claim, isPending: isClaiming } = useClaimTicket();
	const { data: roundStatus } = useRoundStatus(ticket.round);

	const handleClaim = () => {
		claim({ ticket: ticket.betAddress });
	};
	if (!isPending && result[0] > 0n && roundStatus === RoundStatus.CLAIMING) {
		return (
			<div className={'flex flex-row items-center gap-2'}>
				{claimedAmount > 0n && <BetValue className="text-sm" value={claimedAmount} withIcon iconClassName="w-3 h-3" />}
				{!isClaimed && !isClaimedPending && (
					<Badge onClick={handleClaim} className="w-12 justify-center">
						{isClaiming ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Claim'}
					</Badge>
				)}
				{isClaimed && <Badge className="bg-muted/10 text-muted-foreground">{t('claimed')}</Badge>}
				<Badge className="bg-green-500 text-white">{t('won')}</Badge>
			</div>
		);
	}
}

export default Win;
