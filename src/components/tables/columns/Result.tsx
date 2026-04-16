import { useTranslation } from 'react-i18next';
import WinningLine from '@/src/components/tables/columns/WinningLine.tsx';
import { getRoundTimes, useInterval, useRoundOffset } from '@/src/lib/query';
import Countdown from '../../Countdown';

function Result({ roundId, status }: { roundId: bigint; status: string }) {
	const { t } = useTranslation('lottery');
	const { data: interval } = useInterval();
	const { data: offset } = useRoundOffset();

	const finish = interval ? getRoundTimes(roundId, interval, offset ?? 0n).end : 0;
	const now = Math.floor(Date.now() / 1000);
	const roundEnded = finish > 0 && finish <= now;

	if (status === 'cancelled') {
		return <div className={'text-muted-foreground'}>{t('refunded')}</div>;
	}

	if (status === 'spinning') {
		return <div className={'text-muted-foreground'}>{t('waitingForResult')}</div>;
	}

	if (status === 'open') {
		if (roundEnded) {
			return <div className={'text-muted-foreground'}>{t('placeBet.waitingForDraw')}</div>;
		}
		return (
			<div className={'text-muted-foreground flex items-start '}>
				<Countdown finish={finish} className="h-0" />
			</div>
		);
	}

	if (status === 'settled') {
		return <WinningLine roundId={roundId} />;
	}

	return <div className={'text-muted-foreground'}>{t('waiting')}</div>;
}

export default Result;
