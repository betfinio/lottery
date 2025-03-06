import type { GetRoundJackpotsQuery, JackpotFragment } from '@/.graphclient';
import { ETHSCAN, LOTTERY_ADDRESS } from '@/src/globals';
import { useGetRoundFromParams, useRoundJackpots } from '@/src/lib/query';
import type { JackpotCombination } from '@/src/lib/types';
import { truncateEthAddress } from '@betfinio/abi';
import { BetValue, DataTable } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import type { Table } from '@tanstack/react-table';
import { type FC, useEffect, useRef } from 'react';
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
		columnHelper.accessor('owner', {
			header: t('ticketOwner'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => (
				<a href={`${ETHSCAN}/address/${props.row.original.owner}`} target="_blank" rel="noreferrer">
					{truncateEthAddress(props.row.original.owner as Address)}
				</a>
			),
		}),
		columnHelper.accessor('betAddress', {
			header: t('betId'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => (
				<a href={`${ETHSCAN}/address/${props.row.original.betAddress}`} target="_blank" rel="noreferrer">
					{truncateEthAddress(props.row.original.betAddress as Address)}
				</a>
			),
		}),
		columnHelper.accessor('tokenId', {
			header: t('ticketNumber'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => (
				<a href={`${ETHSCAN}/nft/${LOTTERY_ADDRESS}/${props.row.original.tokenId}`} target="_blank" rel="noreferrer">
					#{Number(props.row.original.tokenId)}
				</a>
			),
		}),
		columnHelper.accessor('lines.claimed', {
			header: t('ticketWinning'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => {
				const lines = props.row.original.lines.filter((line) => line.combination === currentJackpot.combination);
				const lineTotal = lines.reduce((acc, line) => acc + BigInt(line.claimed), BigInt(0));
				return <BetValue value={lineTotal} withIcon />;
			},
		}),
	] as ColumnDef<Ticket>[];

	return <DataTable className="w-full" columns={columns} data={tickets} />;
};
