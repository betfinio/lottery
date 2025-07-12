import { ZeroAddress } from '@betfinio/abi';
import { type FC, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useGetRoundFromParams, useRoundStatus, useRoundTicketsByPlayer, useTicketPrice, useWinningLine } from '@/src/lib/query';
import { type IRoundTicket, type IRoundTicketWithWinningCoef, RoundStatus } from '@/src/lib/types';
import { calculateTicketPrize, compareLines } from '@/src/lib/utils';
import { PlayerDidNotWin } from './PlayerDidNotWin';
import PlayerTickets from './PlayerTickets';
import { PlayerWon } from './PlayerWon';
import { RoundNotCalculated } from './RoundNotCalculated';

export const PlayerStatusForRound: FC = () => {
	const { address = ZeroAddress } = useAccount();
	const round = useGetRoundFromParams();
	const { data: roundStatus } = useRoundStatus(round);
	const { data: tickets = [], isFetching: isFetchingTickets } = useRoundTicketsByPlayer(round, address);
	const { data: winningLine } = useWinningLine(round);
	const { data: ticketPrice } = useTicketPrice(round);

	const playerHasBets = tickets.length > 0 && !isFetchingTickets;

	const showCalculating = [RoundStatus.WAITING_FOR_REQUEST, RoundStatus.PENDING, RoundStatus.GENERATING, undefined].includes(roundStatus);

	const ticketsWithCountedCoef: IRoundTicketWithWinningCoef[] = useMemo(() => {
		if (!winningLine) return [];
		return tickets.map((ticket) => {
			const linesWithCoef = ticket.lines.reduce((acc, line) => {
				return acc + BigInt(compareLines(line, winningLine, ticket.lines.length >= 3));
			}, 0n);

			const ticketPrize = calculateTicketPrize(winningLine, ticket.lines, ticketPrice || 0n, ticket.lines.length > 2);

			return {
				...ticket,
				winningCoef: linesWithCoef,
				winingAmount: linesWithCoef * BigInt(ticketPrice || 0),
				prizeAmount: ticketPrize.prizeAmount,
				freeTicketsCount: ticketPrize.freeTicketsCount,
				placedAmount: BigInt(ticketPrice || 0) * BigInt(ticket.lines.length),
			};
		});
	}, [tickets, winningLine, ticketPrice]);
	const playerWinningTicketsWithWinningLines = useMemo(() => {
		if (!ticketsWithCountedCoef) return [];
		return ticketsWithCountedCoef.reduce(
			(acc, ticket) => {
				if (ticket.winningCoef > 0n && winningLine) {
					const ticketLines = ticket.lines.filter((line) => compareLines(line, winningLine, ticket.lines.length >= 3) > 0);
					acc.push({ ...ticket, lines: ticketLines, totalLines: ticket.lines.length });
				}
				return acc;
			},
			[] as (IRoundTicket & { totalLines: number })[],
		);
	}, [ticketsWithCountedCoef]);

	const hasWinningTicket = ticketsWithCountedCoef.some((ticket) => ticket.winningCoef > 0);
	const ticketStats = useMemo(
		() =>
			ticketsWithCountedCoef.reduce(
				(acc, ticket) => {
					acc.winingAmount += ticket.winingAmount;
					acc.placedAmount += ticket.placedAmount;

					acc.freeTicketsCount += ticket.freeTicketsCount;
					acc.prizeAmount += ticket.prizeAmount;
					return acc;
				},
				{ placedAmount: 0n, winingAmount: 0n, freeTicketsCount: 0, prizeAmount: 0n },
			),
		[ticketsWithCountedCoef],
	);

	const showPlayerDidNotWin = !showCalculating && !hasWinningTicket && ticketPrice && roundStatus && !isFetchingTickets;
	const showPlayerWon = !showCalculating && playerHasBets && hasWinningTicket;

	if (roundStatus === undefined) {
		return null;
	}

	if (roundStatus && showCalculating) {
		return (
			<div className="pb-8 h-full flex flex-col items-center justify-center">
				<RoundNotCalculated />
			</div>
		);
	}

	if (showPlayerDidNotWin) {
		return (
			<div className="flex flex-col items-center">
				<div className="flex gap-5 flex-wrap justify-end ">
					<div className="mt-auto">
						<PlayerDidNotWin playerHasBets={playerHasBets} />
					</div>
					<div>{playerHasBets && <PlayerTickets />}</div>
				</div>
			</div>
		);
	}
	if (showPlayerWon) {
		return (
			<div className="flex flex-col items-center justify-center">
				<div className="flex gap-5 flex-wrap justify-center">
					<PlayerWon
						freeTicketsCount={ticketStats.freeTicketsCount}
						prizeAmount={ticketStats.prizeAmount}
						placedAmount={ticketStats.placedAmount}
						winingAmount={ticketStats.winingAmount}
						winningLine={winningLine}
						winningCoef={ticketStats.winingAmount / ticketStats.placedAmount}
						tickets={playerWinningTicketsWithWinningLines}
					/>
					<PlayerTickets />
				</div>
			</div>
		);
	}
	return null;
};
