import { ZeroAddress } from '@betfinio/abi';
import { DataTable } from '@betfinio/components/shared';
import { useNavigate } from '@tanstack/react-router';
import { type FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { getRoundTimes, useInterval, usePlayerRounds, useRoundOffset } from '@/src/lib/query';
import type { IRound } from '@/src/lib/types';
import { statusesAllowedToSeeRound } from '@/src/routes/games/lottery/lotto/$round';
import { defineColumns } from './columns';

interface MyDrawsProps {
	includeFutureDraws: boolean;
}

/**
 * MyDraws component displays lottery draws that the current user has participated in
 *
 * @param {Object} props - Component props
 * @param {boolean} props.includeFutureDraws - Flag to include upcoming draws in the table
 */
const MyDraws: FC<MyDrawsProps> = ({ includeFutureDraws }) => {
	const { t } = useTranslation('lottery', { keyPrefix: 'tables' });
	const { t: sharedT } = useTranslation('shared', { keyPrefix: 'tables' });
	const navigate = useNavigate();
	const { address = ZeroAddress } = useAccount();
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

	const columns = defineColumns(t, true);
	const { data: rounds = [] } = usePlayerRounds(address);
	const { data: interval } = useInterval();
	const { data: offset } = useRoundOffset();

	/**
	 * Handles row click event to navigate to round details
	 * Only navigates if the round has an allowed status
	 */
	const handleRowClick = (row: IRound) => {
		if (statusesAllowedToSeeRound.includes(row.status)) {
			navigate({
				to: '/games/lottery/lotto/$round',
				params: { round: row.roundId.toString() },
			});
		}
	};

	// Filter rounds based on includeFutureDraws flag
	const filteredRounds = useMemo(() => {
		if (!interval) return [];
		const currentTime = Math.floor(Date.now() / 1000);
		return includeFutureDraws
			? rounds
			: rounds.filter((round) => {
					const { end } = getRoundTimes(round.roundId, interval, offset);
					return end <= currentTime;
				});
	}, [rounds, includeFutureDraws, interval, offset]);

	return (
		<DataTable
			enableSorting={true}
			data={filteredRounds}
			columns={columns}
			onRowClick={handleRowClick}
			pagination={pagination}
			onPaginationChange={setPagination}
			t={sharedT}
		/>
	);
};

export default MyDraws;
