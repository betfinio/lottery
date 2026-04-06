import { truncateEthAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import type { FC } from 'react';
import { useMemo } from 'react';
import { ETHSCAN } from '@/src/globals';
import type { IBet, ITicket } from '@/src/lib/types';
import { compareTickets, partlyEquals } from '@/src/lib/utils';
import { NumberComponent, SymbolElement } from '../Line';

interface TicketCardProps {
	ticket: IBet;
	winningLine: ITicket | null | undefined;
	totalTickets: number;
}
export const TicketCard: FC<TicketCardProps> = ({ ticket, winningLine, totalTickets }) => {
	const tickets = useMemo(
		() => ticket.tickets.toSorted((a, b) => (winningLine ? (compareTickets(b, winningLine) > compareTickets(a, winningLine) ? 1 : -1) : 0)),
		[ticket.tickets, winningLine],
	);
	return (
		<div className="border border-purple-box rounded-xl p-2 bg-secondary">
			<div className={'flex flex-row items-center gap-2 mb-2'}>
				<a href={`${ETHSCAN}/address/${ticket.betAddress}`} target="_blank" rel="noreferrer">
					{truncateEthAddress(ticket.betAddress)}
				</a>

				<div className={'text text-muted-foreground'}>
					{tickets.length} of {totalTickets} tickets
				</div>
			</div>
			<div className="flex flex-col gap-2 max-h-36 overflow-y-auto justify-start">
				{tickets.map((line, index) => (
					<div key={index} className="flex flex-row gap-2 items-center justify-center">
						{line.numbers.map((number, index) => (
							<NumberComponent
								key={index}
								className={cn({
									'stroke-success stroke-2': winningLine && partlyEquals(line, winningLine, index),
								})}
							>
								{number}
							</NumberComponent>
						))}
						+
						<NumberComponent
							isSymbol
							className={cn({
								'stroke-success stroke-2': winningLine && line.symbol === winningLine.symbol,
							})}
						>
							<SymbolElement symbol={line.symbol} />
						</NumberComponent>
					</div>
				))}
			</div>
		</div>
	);
};
