import Line from '@/src/components/shared/SharedLine';
import { useWinningLine } from '@/src/lib/query';
import { useManualRequest } from '@/src/lib/query/mutations.ts';
import { useTranslation } from 'react-i18next';
import type { Address } from 'viem';

function WinningLine({ round }: { round: Address }) {
	const { t } = useTranslation('lottery');
	const { data = null } = useWinningLine(round);
	const { mutate } = useManualRequest();
	const handleRequest = () => {
		const result = confirm('Do you want to manual request?');
		if (result) {
			mutate({ round });
		}
	};
	if (data === null)
		return (
			<div className={'text-muted-foreground'} onClick={handleRequest}>
				{t('waiting')}
			</div>
		);
	return <Line line={data} symbolUnlocked={true} />;
}

export default WinningLine;
