import logger from '@/src/config/logger';
import { useBalance } from '@/src/lib/query';
import { ZeroAddress, valueToNumber } from '@betfinio/abi';
import { Button } from '@betfinio/components/ui';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

export const Route = createFileRoute('/')({
	component: () => <Index />,
});

function Index() {
	// example of using i18n
	const { t } = useTranslation('template');
	// example of using wagmi
	const { address = ZeroAddress } = useAccount();
	// example of using query
	const { data: balance = 0n } = useBalance(address);
	// example of using logger
	logger.success('Hello, world!');
	return (
		<div className={'p-2 md:p-3 lg:p-4 flex flex-col gap-2 '}>
			{t('title')}
			<div className={'border border-primary rounded-md p-4'}>Your balance: {valueToNumber(balance)} BET</div>
			<Button className={''}>{t('title')}</Button>
		</div>
	);
}
