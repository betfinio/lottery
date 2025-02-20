import { useActiveRounds, useOldRounds } from '@/src/lib/query';
import type { IRound } from '@/src/lib/types';
import { DataTable } from '@betfinio/components/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { defineColumns } from './columns';

function AllDraws() {
	const { t } = useTranslation('lottery', { keyPrefix: 'tables' });

	const columns = defineColumns(t);
	const navigate = useNavigate();

	const { data: oldRounds = [] } = useOldRounds();
	const { data: activeRounds = [] } = useActiveRounds();
	const rounds = activeRounds.length > 0 ? [activeRounds[0], ...oldRounds] : oldRounds;
	const queryClient = useQueryClient();
	const handleRowClick = (row: IRound) => {
		const data = queryClient.getQueryData(['lottery', 'round', row.address, 'status']);
		if (row.finish <= Math.floor(Date.now() / 1000) && (data === 3 || data === 4)) {
			navigate({ to: '/games/lottery/lotto/$round', params: { round: row.address } });
		}
	};

	return <DataTable enableSorting={true} data={rounds} columns={columns} onRowClick={handleRowClick} />;
}

export default AllDraws;
