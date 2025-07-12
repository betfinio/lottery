import { ZeroAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { useMediaQuery } from '@betfinio/components/hooks';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useGetRoundFromParams, useRoundTicketsByPlayer } from '@/src/lib/query';
import TicketsList from '../../tabs/TicketsList';

const PlayerTickets: FC<{ className?: string }> = ({ className }) => {
	const { t } = useTranslation('lottery');
	const round = useGetRoundFromParams();
	const { address = ZeroAddress } = useAccount();
	const { data: tickets = [] } = useRoundTicketsByPlayer(round, address);
	const { isMobile } = useMediaQuery();
	return (
		<div
			className={cn(
				'flex flex-col mt-auto items-center justify-between min-w-[388px] border border-border rounded-lg h-[590px] px-2 md:px-3 lg:px-4',
				className,
			)}
		>
			<div className="font-medium text-muted-foreground py-4 w-full">{t('yourTickets')}</div>
			{tickets.length > 0 ? (
				<TicketsList tickets={tickets} old={true} itemsPerPage={isMobile ? 3 : 2} />
			) : (
				<div className="flex flex-col items-center justify-center h-full">
					<div className="text-muted-foreground">{t('noTickets')}</div>
				</div>
			)}
		</div>
	);
};

export default PlayerTickets;
