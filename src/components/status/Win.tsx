import { Badge } from '@betfinio/components/ui';
import { useTranslation } from 'react-i18next';
import type { IBet } from '@/src/lib/types';

function Win({ ticket }: { ticket: IBet }) {
	const { t } = useTranslation('lottery');

	// Show "Won" badge when ticket is resolved and has a prize
	if (ticket.status === 'resolved' && ticket.prize !== null && ticket.prize > 0n) {
		return (
			<div className={'flex flex-row items-center gap-2'}>
				<Badge className="bg-green-500 text-white">{t('won')}</Badge>
			</div>
		);
	}
}

export default Win;
