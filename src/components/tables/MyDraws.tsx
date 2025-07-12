import { ZeroAddress } from '@betfinio/abi';
import { DataTable } from '@betfinio/components/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { usePlayerRounds } from '@/src/lib/query';
import type { IRound, RoundStatus } from '@/src/lib/types';
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
	// Hooks for translation, navigation and data fetching
	const { t } = useTranslation('lottery', { keyPrefix: 'tables' });
	const { t: sharedT } = useTranslation('shared', { keyPrefix: 'tables' });
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { address = ZeroAddress } = useAccount();

	// Get table columns with isMyDraws flag set to true
	const columns = defineColumns(t, true);

	// Fetch rounds the player has participated in
	const { data: rounds = [] } = usePlayerRounds(address);

	/**
	 * Handles row click event to navigate to round details
	 * Only navigates if the round has finished and has an allowed status
	 */
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

	// Filter rounds based on includeFutureDraws flag
	const filteredRounds = useMemo(() => {
		const currentTime = Math.floor(Date.now() / 1000);
		return includeFutureDraws ? rounds : rounds.filter((round) => round.finish <= currentTime);
	}, [rounds, includeFutureDraws]);

	return <DataTable enableSorting={true} data={filteredRounds} columns={columns} onRowClick={handleRowClick} t={sharedT} />;
};

export default MyDraws;
