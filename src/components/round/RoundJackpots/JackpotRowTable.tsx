import type { JackpotCombination } from '@/src/lib/types';
import { DataTable } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
const columnHelper = createColumnHelper<JackpotCombination>();

export const JackpotRowTable = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const columns = [
		columnHelper.accessor('bet', {
			header: t('betId'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => <div>{t('betId')}</div>,
		}),
		columnHelper.accessor('player', {
			header: t('ticketOwner'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => <div>{t('ticketOwner')}</div>,
		}),
		columnHelper.accessor('ticketNumber', {
			header: t('ticketNumber'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => <div>{t('ticketNumber')}</div>,
		}),
		columnHelper.accessor('winAmount', {
			header: t('ticketWinning'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => <div>{t('ticketNumber')}</div>,
		}),
	] as ColumnDef<JackpotCombination>[];
	return <DataTable className="w-full" hidePagination={true} state={{ pagination: undefined }} columns={columns} data={[]} />;
};
