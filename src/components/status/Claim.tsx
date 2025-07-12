import { BetValue } from '@betfinio/components/shared';
import { Badge, Button } from '@betfinio/components/ui';
import { LoaderIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useRoundStatus, useTicketClaimed, useTicketPrice, useTicketResult, useTicketWinAmount, useWinningLine } from '@/src/lib/query';
import { useClaimTicket } from '@/src/lib/query/mutations';
import { EMPTY_LINE, type IRoundTicket, RoundStatus } from '@/src/lib/types';
import { calculateTicketPrize } from '@/src/lib/utils';
import { FreeTicketTooltip } from '../shared/FreeTicketTooltip';

function Claim({ ticket }: { ticket: IRoundTicket }) {
	const { data: result = [0n, false], isPending } = useTicketResult(ticket.betAddress, ticket.round);
	const { data: claimedAmount = 0n } = useTicketWinAmount(ticket.betAddress);
	const { data: isClaimed, isPending: isClaimedPending } = useTicketClaimed(ticket.betAddress);
	const { mutate: claim, isPending: isClaiming } = useClaimTicket();
	const { data: roundStatus } = useRoundStatus(ticket.round);
	const { data: ticketPrice = 0n } = useTicketPrice(ticket.round);
	const { data: winningLine } = useWinningLine(ticket.round);

	const handleClaim = () => {
		claim({ ticket: ticket.betAddress });
	};

	const predictedWin = result[0] * ticketPrice;
	const winAmount = claimedAmount || predictedWin;
	const calculatedPrize = useMemo(() => {
		return calculateTicketPrize(winningLine ?? EMPTY_LINE, ticket.lines, ticketPrice);
	}, [winningLine, ticket.lines, ticketPrice]);

	const handleValidate = () => {
		claim({ ticket: ticket.betAddress });
	};

	if (!isPending && winAmount > 0n && roundStatus === RoundStatus.CLAIMING) {
		return (
			<PrizeToClaim
				freeTicketsCount={calculatedPrize.freeTicketsCount}
				prizeAmount={calculatedPrize.prizeAmount}
				handleClaim={handleClaim}
				isClaimed={!!isClaimed}
				isClaimedPending={isClaimedPending}
				isClaiming={isClaiming}
			/>
		);
	}
	if (!isPending && result[0] === 0n && roundStatus === RoundStatus.CLAIMING && !isClaimed) {
		return (
			<div className={'flex flex-row items-center gap-2'} onClick={handleValidate}>
				<Badge className="bg-primary text-primary-foreground">{isClaiming ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Validate'}</Badge>
			</div>
		);
	}
}

export default Claim;

const PrizeToClaim = ({
	freeTicketsCount,
	prizeAmount,
	handleClaim,
	isClaimed,
	isClaimedPending,
	isClaiming,
}: {
	freeTicketsCount: number;
	prizeAmount: bigint;
	handleClaim: () => void;
	isClaimed: boolean;
	isClaimedPending: boolean;
	isClaiming: boolean;
}) => {
	return (
		<div className={'flex flex-row items-center gap-2'}>
			{freeTicketsCount > 0 && (
				<div className="flex flex-row items-center gap-1">
					{freeTicketsCount}
					<FreeTicketTooltip />
				</div>
			)}
			{prizeAmount > 0n && <BetValue className="text-sm" value={prizeAmount} withIcon iconClassName="w-3 h-3" />}
			{!isClaimed && !isClaimedPending && (
				<Button size="freeSize" shape="pill" onClick={handleClaim} className="w-16 h-5 justify-center">
					{isClaiming ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Claim'}
				</Button>
			)}
			{isClaimed && <Badge className="bg-muted/10 text-muted-foreground">Claimed</Badge>}
		</div>
	);
};
