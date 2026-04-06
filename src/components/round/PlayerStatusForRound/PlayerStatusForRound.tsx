import { ZeroAddress } from '@betfinio/abi';
import { type FC, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useGetRoundFromParams, usePlayerBetsByRound, useRoundDetails, useTicketPrice, useWinningLine } from '@/src/lib/query';
import type { IBet, IBetWithWinningCoef } from '@/src/lib/types';
import { calculateBetPrize, compareTickets } from '@/src/lib/utils';
import { PlayerDidNotWin } from './PlayerDidNotWin';
import PlayerTickets from './PlayerTickets';
import { PlayerWon } from './PlayerWon';
import { RoundNotCalculated } from './RoundNotCalculated';

export const PlayerStatusForRound: FC = () => {
	const { address = ZeroAddress } = useAccount();
	const roundId = useGetRoundFromParams();
	const { data: roundDetails } = useRoundDetails(roundId);
	const { data: tickets = [], isFetching: isFetchingTickets } = usePlayerBetsByRound(roundId, address);
	const { data: winningLine } = useWinningLine(roundId);
	const { data: ticketPrice } = useTicketPrice();

	const roundStatus = roundDetails?.status;
	const playerHasBets = tickets.length > 0 && !isFetchingTickets;

	// Show calculating for rounds that are not yet settled
	const showCalculating = ['spinning', 'open', undefined].includes(roundStatus) && roundDetails !== undefined;

	const betsWithCountedCoef: IBetWithWinningCoef[] = useMemo(() => {
		if (!winningLine) return [];
		return tickets.map((bet) => {
			const ticketsWithCoef = bet.tickets.reduce((acc, t) => {
				return acc + BigInt(compareTickets(t, winningLine));
			}, 0n);

			const betPrize = calculateBetPrize(winningLine, bet.tickets, ticketPrice || 0n);

			return {
				...bet,
				winningCoef: ticketsWithCoef,
				winingAmount: ticketsWithCoef * BigInt(ticketPrice || 0),
				prizeAmount: betPrize.prizeAmount,
				placedAmount: BigInt(ticketPrice || 0) * BigInt(bet.tickets.length),
			};
		});
	}, [tickets, winningLine, ticketPrice]);
	const playerWinningBetsWithWinningTickets = useMemo(() => {
		if (!betsWithCountedCoef) return [];
		return betsWithCountedCoef.reduce(
			(acc, bet) => {
				if (bet.winningCoef > 0n && winningLine) {
					const winningTickets = bet.tickets.filter((t) => compareTickets(t, winningLine) > 0);
					acc.push({ ...bet, tickets: winningTickets, totalTickets: bet.tickets.length });
				}
				return acc;
			},
			[] as (IBet & { totalTickets: number })[],
		);
	}, [betsWithCountedCoef]);

	const hasWinningBet = betsWithCountedCoef.some((bet) => bet.winningCoef > 0);
	const betStats = useMemo(
		() =>
			betsWithCountedCoef.reduce(
				(acc, bet) => {
					acc.winingAmount += bet.winingAmount;
					acc.placedAmount += bet.placedAmount;
					acc.prizeAmount += bet.prizeAmount;
					return acc;
				},
				{ placedAmount: 0n, winingAmount: 0n, prizeAmount: 0n },
			),
		[betsWithCountedCoef],
	);

	const showPlayerDidNotWin = !showCalculating && !hasWinningBet && ticketPrice && roundStatus && !isFetchingTickets;
	const showPlayerWon = !showCalculating && playerHasBets && hasWinningBet;

	if (roundStatus === undefined) {
		return null;
	}

	if (showCalculating) {
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
						prizeAmount={betStats.prizeAmount}
						placedAmount={betStats.placedAmount}
						winingAmount={betStats.winingAmount}
						winningLine={winningLine}
						winningCoef={betStats.placedAmount > 0n ? betStats.winingAmount / betStats.placedAmount : 0n}
						bets={playerWinningBetsWithWinningTickets}
					/>
					<PlayerTickets />
				</div>
			</div>
		);
	}
	return null;
};
