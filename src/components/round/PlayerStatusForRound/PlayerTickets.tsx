import { useGetRoundFromParams, useRoundTicketsByPlayer } from '@/src/lib/query';
import { ZeroAddress } from '@betfinio/abi';
import type { FC } from 'react';
import { useAccount } from 'wagmi';
import TicketsList from '../../tabs/TicketsList';

const PlayerTickets: FC = () => {
	const round = useGetRoundFromParams();
	const { address = ZeroAddress } = useAccount();
	const { data: tickets = [] } = useRoundTicketsByPlayer(round, address);
	return (
		<div className="flex flex-col mt-auto items-center justify-center min-w-[388px] border border-border rounded-lg h-[430px] px-2 md:px-3 lg:px-4">
			<div className="font-medium text-muted-foreground my-4 w-full">Your tickets</div>
			<TicketsList tickets={tickets} old={true} itemsPerPage={3} />
		</div>
	);
};

export default PlayerTickets;
