import type { GetRoundJackpotsQuery, JackpotFragment } from '@/.graphclient';
import { ETHSCAN, LOTTERY_ADDRESS } from '@/src/globals';
import { useGetRoundFromParams, useRoundJackpots } from '@/src/lib/query';
import { ZeroAddress, truncateEthAddress } from '@betfinio/abi';
import { Ticket as TicketIcon } from '@betfinio/components/icons';
import { BetValue, DataTable } from '@betfinio/components/shared';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { useUsername } from 'betfinio_context/lib/query';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';

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
	const { t: sharedT } = useTranslation('shared', { keyPrefix: 'tables' });

	const columns = [
		columnHelper.accessor('owner', {
			header: t('ticketOwner'),
			meta: {
				className: 'h-[50px]',
			},
			cell: (props) => {
				const { address = ZeroAddress } = useAccount();
				const { data: username } = useUsername(props.row.original.owner as Address, address);
				return (
					<a href={`${ETHSCAN}/address/${props.row.original.owner}`} className="text-bonus" target="_blank" rel="noreferrer">
						{username}
					</a>
				);
			},
		}),
		columnHelper.accessor('betAddress', {
			header: t('betId'),
			meta: {
				className: 'h-[50px] hidden md:table-cell',
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
				console.log(currentJackpot.combination);
				// display free lines won if the combination is 0x322b31
				if (['0x322b31', '0x33'].includes(currentJackpot.combination)) {
					return (
						<div className="flex items-center gap-2">
							{lines.filter((line) => line.claimed > 0n).length} <TicketIcon className="w-4 h-4 text-success" />
						</div>
					);
				}
				const lineTotal = lines.reduce((acc, line) => acc + BigInt(line.claimed), BigInt(0));

				return <BetValue value={lineTotal} withIcon />;
			},
		}),
	] as ColumnDef<Ticket>[];

	return <DataTable className="w-full" columns={columns} data={tickets} t={sharedT} />;
};
