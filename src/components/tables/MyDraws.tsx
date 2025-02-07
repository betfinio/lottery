import { usePlayerRounds } from '@/src/lib/query';
import { ZeroAddress } from '@betfinio/abi';
import { DataTable } from '@betfinio/components/shared';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { defineColumns } from './columns';

function MyDraws() {
	const { t } = useTranslation('lottery', { keyPrefix: 'tables' });

	const columns = defineColumns(t);
	const { address = ZeroAddress } = useAccount();

	const { data: rounds = [] } = usePlayerRounds(address);
	return <DataTable data={rounds} columns={columns} />;
}

export default MyDraws;
