import Round from '@/src/components/tables/columns/Round.tsx';
import { useActiveRounds, useOldRounds } from '@/src/lib/query';
import type { IRound } from '@/src/lib/types.ts';
import { BetValue, DataTable } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { defineColumns } from './columns';
import Count from './columns/Count';
import Finish from './columns/Finish';
import Result from './columns/Result';
import RoundActions from './columns/RoundActions';

const columnHelper = createColumnHelper<IRound>();

function AllDraws() {
	const { t } = useTranslation('lottery', { keyPrefix: 'tables' });

	const columns = defineColumns(t);

	const { data: oldRounds = [] } = useOldRounds();
	const { data: activeRounds = [] } = useActiveRounds();
	const rounds = activeRounds.length > 0 ? [activeRounds[0], ...oldRounds] : oldRounds;
	return <DataTable data={rounds} columns={columns} />;
}

export default AllDraws;
