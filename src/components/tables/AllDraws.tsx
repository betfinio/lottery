import { useActiveRounds, useOldRounds } from '@/src/lib/query';
import type { IRound } from '@/src/lib/types.ts';
import { DataTable } from '@betfinio/components/shared';
import { useNavigate } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { defineColumns } from './columns';

const columnHelper = createColumnHelper<IRound>();

function AllDraws() {
	const { t } = useTranslation('lottery', { keyPrefix: 'tables' });

	const columns = defineColumns(t);
	const navigate = useNavigate();

	const { data: oldRounds = [] } = useOldRounds();
	const { data: activeRounds = [] } = useActiveRounds();
	const rounds = activeRounds.length > 0 ? [activeRounds[0], ...oldRounds] : oldRounds;

	const handleRowClick = (row: IRound) => {
		navigate({ to: '/games/lottery/lotto/$round', params: { round: row.address } });
	};

	return <DataTable enableSorting={true} data={rounds} columns={columns} onRowClick={handleRowClick} />;
}

export default AllDraws;
