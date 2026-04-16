import { useTranslation } from 'react-i18next';
import Line from '@/src/components/shared/SharedLine';
import { useWinningLine } from '@/src/lib/query';
import { useSpinRound } from '@/src/lib/query/mutations';

function WinningLine({ roundId }: { roundId: bigint }) {
	const { t } = useTranslation('lottery');
	const { data = null } = useWinningLine(roundId);
	const { mutate } = useSpinRound();
	const handleRequest = () => {
		const result = confirm('Do you want to manual request?');
		if (result) {
			mutate({ roundId });
		}
	};
	if (data === null)
		return (
			<div className={'text-muted-foreground'} onClick={handleRequest}>
				{t('waiting')}
			</div>
		);
	return <Line line={data} disableSymbol={false} />;
}

export default WinningLine;
