import WinningLine from '@/src/components/tables/columns/WinningLine.tsx';
import { useRoundFinish, useRoundStatus } from '@/src/lib/query';
import { RoundStatus } from '@/src/lib/types';
import { useTranslation } from 'react-i18next';
import type { Address } from 'viem';
import Countdown from '../../Countdown';

function Result({ round }: { round: Address }) {
	const { t } = useTranslation('lottery');
	const { data = 0 } = useRoundStatus(round);
	const { data: finish = 0 } = useRoundFinish(round);

	if (data === RoundStatus.ENDED_WITHOUT_BETS) {
		return <div className={'text-muted-foreground'}>{t('ended')}</div>;
	}

	if (data === RoundStatus.PENDING) {
		return <div className={'text-muted-foreground'}>{t('waitingForResult')}</div>;
	}

	if (data === RoundStatus.BETTING) {
		return (
			<div className={'text-muted-foreground flex items-start '}>
				<Countdown finish={finish} className="h-0" />
			</div>
		);
	}

	if (data === RoundStatus.CLAIMING || data === RoundStatus.DONE) {
		return <WinningLine round={round} />;
	}
	if (data === RoundStatus.REFUND) {
		return <div className={'text-muted-foreground'}>{t('refunded')}</div>;
	}
	return <div className={'text-muted-foreground'}>{t('waiting')}</div>;
}

export default Result;
