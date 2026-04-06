import { DataTable } from '@betfinio/components/shared';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getRoundTimes, useAvailableRounds, useInterval, useRoundOffset } from '@/src/lib/query';
import type { IRound } from '@/src/lib/types';
import { statusesAllowedToSeeRound } from '@/src/routes/games/lottery/lotto/$round';
import { defineColumns } from './columns';

interface AllDrawsProps {
	includeFutureDraws: boolean;
}

function AllDraws({ includeFutureDraws }: AllDrawsProps) {
	const { t } = useTranslation('lottery', { keyPrefix: 'tables' });
	const { t: sharedT } = useTranslation('shared', { keyPrefix: 'tables' });
	const navigate = useNavigate();

	const columns = defineColumns(t, false);
	const allRounds = useAvailableRounds();
	const { data: interval } = useInterval();
	const { data: offset } = useRoundOffset();

	const rounds = useMemo(() => {
		console.log(interval, offset, allRounds);

		if (!interval) return [];
		const currentTime = Math.floor(Date.now() / 1000);
		const filtered = includeFutureDraws
			? allRounds
			: allRounds.filter((round) => {
					const { end } = getRoundTimes(round.roundId, interval, offset);
					console.log(12323, end, currentTime);

					return end <= currentTime;
				});
		return filtered.sort((a, b) => Number(b.roundId - a.roundId));
	}, [includeFutureDraws, allRounds, interval, offset]);

	const handleRowClick = (row: IRound) => {
		if (statusesAllowedToSeeRound.includes(row.status)) {
			navigate({
				to: '/games/lottery/lotto/$round',
				params: { round: row.roundId.toString() },
			});
		}
	};

	return <DataTable enableSorting={true} data={rounds} columns={columns} onRowClick={handleRowClick} t={sharedT} />;
}

export default AllDraws;
