import { useGetRoundFromParams, useRoundTicketsByPlayer } from '@/src/lib/query';
import { ZeroAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import TicketsList from '../../tabs/TicketsList';

const PlayerTickets: FC<{ className?: string }> = ({ className }) => {
	const { t } = useTranslation('lottery');
	const round = useGetRoundFromParams();
	const { address = ZeroAddress } = useAccount();
	const { data: tickets = [] } = useRoundTicketsByPlayer(round, address);
	return (
		<div
			className={cn(
				'flex flex-col mt-auto items-center justify-between min-w-[388px] border border-border rounded-lg h-[430px] px-2 md:px-3 lg:px-4',
				className,
			)}
		>
			<div className="font-medium text-muted-foreground py-4 w-full">{t('yourTickets')}</div>
			<TicketsList tickets={tickets} old={true} itemsPerPage={2} />
		</div>
	);
};

export default PlayerTickets;
