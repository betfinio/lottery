import { usePlayerRounds } from '@/src/lib/query';
import type { IRound } from '@/src/lib/types';
import { ZeroAddress } from '@betfinio/abi';
import { DataTable } from '@betfinio/components/shared';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { defineColumns } from './columns';

function MyDraws() {
	const { t } = useTranslation('lottery', { keyPrefix: 'tables' });
	const navigate = useNavigate();
	const columns = defineColumns(t);
	const { address = ZeroAddress } = useAccount();

	const handleRowClick = (row: IRound) => {
		navigate({ to: '/games/lottery/lotto/$round', params: { round: row.address } });
	};
	const { data: rounds = [] } = usePlayerRounds(address);
	return <DataTable data={rounds} columns={columns} onRowClick={handleRowClick} />;
}

export default MyDraws;
