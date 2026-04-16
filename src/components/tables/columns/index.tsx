import { BetValue } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import type { IRound } from '@/src/lib/types';
import Count from './Count';
import Finish from './Finish';
import MyLinesBank from './MyLinesBank';
import MyLinesCount from './MyLinesCount';
import Result from './Result';
import Round from './Round';
import RoundActions from './RoundActions';

export const defineColumns = (t: TFunction<'lottery', 'tables'>, isMy = false): ColumnDef<IRound, any>[] => {
	const columnHelper = createColumnHelper<IRound>();

	return [
		columnHelper.display({
			id: 'finish',
			header: t('headers.finish'),
			meta: {
				className: 'min-w-[100px] whitespace-nowrap',
			},
			cell: (props) => <Finish roundId={props.row.original.roundId} />,
		}),

		columnHelper.display({
			header: t('headers.result'),
			meta: {
				className: 'min-w-[300px]',
			},
			cell: (props) => <Result roundId={props.row.original.roundId} status={props.row.original.status} />,
		}),
		columnHelper.accessor('roundId', {
			header: t('headers.round'),
			meta: {
				className: 'h-[50px] min-w-[100px]',
			},
			cell: (props) => <Round roundId={props.getValue()} />,
		}),
		columnHelper.accessor('betsCount', {
			header: isMy ? t('headers.myTicketsCount') : t('headers.ticketsCount'),
			meta: {
				className: 'min-w-[100px]',
			},
			cell: (props) => (
				<div className="flex items-center gap-1">{isMy ? <MyLinesCount roundId={props.row.original.roundId} /> : <Count count={props.getValue()} />}</div>
			),
		}),
		columnHelper.accessor('betsAmount', {
			header: t('headers.bank'),
			meta: {
				className: 'min-w-[100px]',
			},
			cell: (props) => {
				return isMy ? <MyLinesBank roundId={props.row.original.roundId} /> : <BetValue value={props.row.original.betsAmount} withIcon />;
			},
		}),
		columnHelper.display({
			id: 'actions',
			meta: {
				className: 'w-[30px]',
			},
			cell: (props) => <RoundActions roundId={props.row.original.roundId} status={props.row.original.status} />,
		}),
	];
};
