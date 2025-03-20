import type { IRound } from '@/src/lib/types';
import { BetValue } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import Count from './Count';
import Finish from './Finish';
import MyLinesBank from './MyLinesBank';
import MyLinesCount from './MyLinesCount';
import Result from './Result';
import Round from './Round';
import RoundActions from './RoundActions';

export const defineColumns = (t: TFunction<'lottery', 'tables'>, isMy = false): ColumnDef<IRound, never>[] => {
	const columnHelper = createColumnHelper<IRound>();

	return [
		columnHelper.accessor('finish', {
			header: t('headers.finish'),
			meta: {
				className: 'min-w-[100px] whitespace-nowrap',
			},
			cell: (props) => <Finish timestamp={props.getValue()} />,
		}),

		columnHelper.display({
			header: t('headers.result'),
			meta: {
				className: 'min-w-[300px]',
			},
			cell: (props) => <Result round={props.row.original.address} />,
		}),
		columnHelper.accessor('address', {
			header: t('headers.round'),
			meta: {
				className: 'h-[50px] min-w-[100px]',
			},
			cell: (props) => <Round address={props.getValue()} />,
		}),
		columnHelper.accessor('linesCount', {
			header: isMy ? t('headers.myLinesCount') : t('headers.linesCount'),
			meta: {
				className: 'min-w-[100px]',
			},
			cell: (props) => (
				<div className="flex items-center gap-1">{isMy ? <MyLinesCount round={props.row.original.address} /> : <Count count={props.getValue()} />}</div>
			),
		}),
		columnHelper.accessor('bank', {
			header: t('headers.bank'),
			meta: {
				className: 'min-w-[100px]',
			},
			cell: (props) => {
				return isMy ? (
					<MyLinesBank round={props.row.original.address} ticketPrice={props.row.original.ticketPrice} />
				) : (
					<BetValue value={(props.row.original.ticketPrice ?? 0n) * BigInt(props.row.original.linesCount)} withIcon />
				);
			},
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
