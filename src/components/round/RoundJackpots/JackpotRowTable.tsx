import type { GetRoundJackpotsQuery, JackpotFragment } from '@/.graphclient';
import { useGetRoundFromParams, useRoundJackpots } from '@/src/lib/query';
import type { JackpotCombination } from '@/src/lib/types';
import { truncateEthAddress } from '@betfinio/abi';
import { BetValue, DataTable } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { Address } from 'viem';

type Ticket = JackpotFragment['tickets'][number];
const columnHelper = createColumnHelper<Ticket>();

interface JackpotRowTableProps {
	id: keyof GetRoundJackpotsQuery;
}
export const JackpotRowTable: FC<JackpotRowTableProps> = ({ id }) => {
	const round = useGetRoundFromParams();
	const { data: jackpotData } = useRoundJackpots(round);
	if (!jackpotData) return null;
	const currentJackpot = jackpotData[id][0];
	const tickets = currentJackpot?.tickets ?? [];
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const columns = [
		columnHelper.accessor('betAddress', {
			header: t('betId'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => <div>{truncateEthAddress(props.row.original.betAddress as Address)}</div>,
		}),
		columnHelper.accessor('owner', {
			header: t('ticketOwner'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => <div>{truncateEthAddress(props.row.original.owner as Address)}</div>,
		}),
		columnHelper.accessor('tokenId', {
			header: t('ticketNumber'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => <div>{Number(props.row.original.tokenId)}</div>,
		}),
		columnHelper.accessor('lines.claimed', {
			header: t('ticketWinning'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => {
				const lines = props.row.original.lines.filter((line) => line.combination === currentJackpot.combination);
				const lineTotal = lines.reduce((acc, line) => acc + BigInt(line.claimed), BigInt(0));
				return <BetValue value={lineTotal} />;
			},
		}),
	] as ColumnDef<Ticket>[];
	return <DataTable className="w-full" hidePagination={true} state={{ pagination: undefined }} columns={columns} data={tickets} />;
};
