import { useGetRoundFromParams, useRoundStatus, useRoundTicketsByPlayer, useTicketPrice, useWinningLine } from '@/src/lib/query';
import { type IRoundTicket, type IRoundTicketWithWinningCoef, RoundStatus } from '@/src/lib/types';
import { compareLines } from '@/src/lib/utils';
import { ZeroAddress } from '@betfinio/abi';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
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

	const { t } = useTranslation('lottery', { keyPrefix: 'round' });

	const playerHasBets = tickets.length > 0 && !isFetchingTickets;

	const showCalculating = roundStatus === RoundStatus.WAITING_FOR_REQUEST || roundStatus === RoundStatus.PENDING;

	const ticketsWithCountedCoef: IRoundTicketWithWinningCoef[] = useMemo(() => {
		if (!winningLine) return [];
		return tickets.map((ticket) => {
			const linesWithCoef = ticket.lines.reduce((acc, line) => {
				return acc + BigInt(compareLines(line, winningLine));
			}, 0n);
			return {
				...ticket,
				winningCoef: linesWithCoef,
				winingAmount: linesWithCoef * BigInt(ticketPrice || 0),
				placedAmount: BigInt(ticketPrice || 0) * BigInt(ticket.lines.length),
			};
		});
	}, [tickets, winningLine]);

	const playerWinningTicketsWithWinningLines = useMemo(() => {
		if (!ticketsWithCountedCoef) return [];
		return ticketsWithCountedCoef.reduce(
			(acc, ticket) => {
				if (ticket.winningCoef > 0n && winningLine) {
					const ticketLines = ticket.lines.filter((line) => compareLines(line, winningLine) > 0);
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
					return acc;
				},
				{ placedAmount: 0n, winingAmount: 0n },
			),
		[ticketsWithCountedCoef],
	);

	const showPlayerDidNotWin = !showCalculating && !hasWinningTicket && ticketPrice && roundStatus && !isFetchingTickets;
	const showPlayerWon = !showCalculating && playerHasBets && hasWinningTicket;

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
				{playerHasBets && <div className="text-lg mb-4  font-semibold">{t('yourTicketsInDraw')}</div>}
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
				<div className=" text-lg font-semibold">{t('yourTicketsInDraw')}</div>
				<div className="flex gap-5 flex-wrap justify-center">
					<PlayerWon
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
