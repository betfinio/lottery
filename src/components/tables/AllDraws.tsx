import Round from '@/src/components/tables/columns/Round.tsx';
import { useActiveRounds, useOldRounds } from '@/src/lib/query';
import type { IRound } from '@/src/lib/types.ts';
import { BetValue, DataTable } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import Count from './columns/Count';
import Finish from './columns/Finish';
import Result from './columns/Result';
import RoundActions from './columns/RoundActions';

const columnHelper = createColumnHelper<IRound>();

function AllDraws() {
	const { t } = useTranslation('lottery', { keyPrefix: 'tables' });
	const columns: ColumnDef<IRound, never>[] = [
		columnHelper.accessor('address', {
			header: t('headers.round'),
			meta: {
				className: 'h-[50px] min-w-[100px]',
			},
			cell: (props) => <Round address={props.getValue()} />,
		}),
		columnHelper.display({
			header: t('headers.result'),
			meta: {
				className: 'min-w-[300px]',
			},
			cell: (props) => <Result round={props.row.original.address} />,
		}),
		columnHelper.accessor('finish', {
			header: t('headers.finish'),
			meta: {
				className: 'min-w-[150px]',
			},
			cell: (props) => <Finish timestamp={props.getValue()} />,
		}),
		columnHelper.accessor('linesCount', {
			header: t('headers.linesCount'),
			meta: {
				className: 'min-w-[100px]',
			},
			cell: (props) => <Count count={props.getValue()} />,
		}),
		columnHelper.accessor('bank', {
			header: t('headers.bank'),
			meta: {
				className: 'min-w-[100px]',
			},
			cell: (props) => <BetValue value={props.getValue()} withIcon />,
		}),
		columnHelper.display({
			id: 'actions',
			meta: {
				className: 'w-[30px]',
			},
			cell: (props) => <RoundActions round={props.row.original.address} />,
		}),
	];
	const { data: oldRounds = [] } = useOldRounds();
	const { data: activeRounds = [] } = useActiveRounds();
	const rounds = activeRounds.length > 0 ? [activeRounds[0], ...oldRounds] : oldRounds;
	return <DataTable data={rounds} columns={columns} />;
}

export default AllDraws;
