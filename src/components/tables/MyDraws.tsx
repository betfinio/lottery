import { usePlayerRounds, useTicketPrice } from '@/src/lib/query';
import type { IRound, RoundStatus } from '@/src/lib/types';
import { statusesAllowedToSeeRound } from '@/src/routes/games/lottery/lotto/$round';
import { ZeroAddress } from '@betfinio/abi';
import { DataTable } from '@betfinio/components/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { defineColumns } from './columns';

function MyDraws() {
	const { t } = useTranslation('lottery', { keyPrefix: 'tables' });
	const navigate = useNavigate();
	const columns = defineColumns(t, true);
	const { address = ZeroAddress } = useAccount();
	const queryClient = useQueryClient();

	const handleRowClick = (row: IRound) => {
		const data = queryClient.getQueryData(['lottery', 'round', row.address, 'status']);
		if (row.finish <= Math.floor(Date.now() / 1000) && statusesAllowedToSeeRound.includes(data as RoundStatus)) {
			navigate({ to: '/games/lottery/lotto/$round', params: { round: row.address } });
		}
	};
	const { data: rounds = [] } = usePlayerRounds(address);

	return <DataTable enableSorting={true} data={rounds} columns={columns} onRowClick={handleRowClick} />;
}

export default MyDraws;
