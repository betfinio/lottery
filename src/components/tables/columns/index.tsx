import type { IRound } from '@/src/lib/types';
import { BetValue } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import Count from './Count';
import Finish from './Finish';
import Result from './Result';
import Round from './Round';
import RoundActions from './RoundActions';

export const defineColumns = (t: TFunction<'lottery', 'tables'>): ColumnDef<IRound, never>[] => {
	const columnHelper = createColumnHelper<IRound>();

	return [
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
};
