import { Badge } from '@betfinio/components/ui';
import { useTranslation } from 'react-i18next';
import { useRoundStatus, useTicketResult } from '@/src/lib/query';
import { type IRoundTicket, RoundStatus } from '@/src/lib/types';

function Win({ ticket }: { ticket: IRoundTicket }) {
	const { t } = useTranslation('lottery');
	const { data: result = [0n, false], isPending } = useTicketResult(ticket.betAddress, ticket.round);
	const { data: roundStatus } = useRoundStatus(ticket.round);

	if (!isPending && result[0] > 0n && roundStatus === RoundStatus.CLAIMING) {
		return (
			<div className={'flex flex-row items-center gap-2'}>
				<Badge className="bg-green-500 text-white">{t('won')}</Badge>
			</div>
		);
	}
}

export default Win;
