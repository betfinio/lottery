import { useRoundStatus, useTicketClaimed, useTicketResult, useTicketWinAmount } from '@/src/lib/query';
import { type IRoundTicket, RoundStatus } from '@/src/lib/types';
import { BetValue } from '@betfinio/components/shared';
import { Badge } from '@betfinio/components/ui';

function Win({ ticket }: { ticket: IRoundTicket }) {
	const { data: result = [0n, false], isPending } = useTicketResult(ticket.betAddress, ticket.round);
	const { data: roundStatus } = useRoundStatus(ticket.round);

	if (!isPending && result[0] > 0n && roundStatus === RoundStatus.CLAIMING) {
		return (
			<div className={'flex flex-row items-center gap-2'}>
				<Badge className="bg-green-500 text-white">Won</Badge>
			</div>
		);
	}
}

export default Win;
