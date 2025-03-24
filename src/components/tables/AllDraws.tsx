import { useActiveRounds, useOldRounds } from '@/src/lib/query';
import type { IRound, RoundStatus } from '@/src/lib/types';
import { statusesAllowedToSeeRound } from '@/src/routes/games/lottery/lotto/$round';
import { DataTable } from '@betfinio/components/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { defineColumns } from './columns';

interface AllDrawsProps {
	includeFutureDraws: boolean;
}

function AllDraws({ includeFutureDraws }: AllDrawsProps) {
	const { t } = useTranslation('lottery', { keyPrefix: 'tables' });
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const columns = defineColumns(t, false);
	const { data: oldRounds = [] } = useOldRounds();
	const { data: activeRounds = [] } = useActiveRounds();

	const rounds = useMemo(() => {
		const allRounds = includeFutureDraws ? [...activeRounds, ...oldRounds].sort((a, b) => b.finish - a.finish) : oldRounds;
		return allRounds.filter((round) => round.ticketCount > 0);
	}, [includeFutureDraws, activeRounds, oldRounds]);

	const handleRowClick = (row: IRound) => {
		const currentTime = Math.floor(Date.now() / 1000);
		const roundStatus = queryClient.getQueryData(['lottery', 'round', row.address, 'status']) as RoundStatus;

		if (row.finish <= currentTime && statusesAllowedToSeeRound.includes(roundStatus)) {
			navigate({
				to: '/games/lottery/lotto/$round',
				params: { round: row.address },
			});
		}
	};

	return <DataTable enableSorting={true} data={rounds} columns={columns} onRowClick={handleRowClick} />;
}

export default AllDraws;
