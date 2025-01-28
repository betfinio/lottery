import Round from '@/src/components/tables/columns/Round.tsx';
import { useOldRounds } from '@/src/lib/query';
import type { IRound } from '@/src/lib/types.ts';
import { BetValue, DataTable } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import Count from './columns/Count';
import Finish from './columns/Finish';
import Result from './columns/Result';

const columnHelper = createColumnHelper<IRound>();

function AllDraws() {
	const { t } = useTranslation('lottery', { keyPrefix: 'tables' });
	const columns: ColumnDef<IRound, never>[] = [
		columnHelper.accessor('address', {
			header: t('headers.round'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => <Round address={props.getValue()} />,
		}),
		columnHelper.display({
			header: t('headers.result'),
			meta: {
				className: 'w-[300px]',
			},
			cell: (props) => <Result round={props.row.original.address} />,
		}),
		columnHelper.accessor('finish', {
			header: t('headers.finish'),
			cell: (props) => <Finish timestamp={props.getValue()} />,
		}),
		columnHelper.accessor('linesCount', {
			header: t('headers.linesCount'),
			cell: (props) => <Count count={props.getValue()} />,
		}),
		columnHelper.accessor('bank', {
			header: t('headers.bank'),
			cell: (props) => <BetValue value={props.getValue()} withIcon />,
		}),
	];
	const { data: rounds = [] } = useOldRounds();
	return <DataTable data={rounds} columns={columns} />;
}

export default AllDraws;
