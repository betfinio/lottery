import { ETHSCAN, LOTTERY_ADDRESS } from '@/src/globals';
import type { ILine, IRoundTicket } from '@/src/lib/types';
import { compareLines, partlyEquals } from '@/src/lib/utils';
import { cn } from '@betfinio/components';
import type { FC } from 'react';
import { useMemo } from 'react';
import { NumberComponent, SymbolElement } from '../Line';

interface TicketCardProps {
	ticket: IRoundTicket;
	winningLine: ILine | null | undefined;
}
export const TicketCard: FC<TicketCardProps> = ({ ticket, winningLine }) => {
	const lines = useMemo(
		() => ticket.lines.toSorted((a, b) => (winningLine ? (compareLines(b, winningLine) > compareLines(a, winningLine) ? 1 : -1) : 0)),
		[ticket.lines, winningLine],
	);
	return (
		<div className="border border-purple-box rounded-xl p-2 bg-secondary">
			<div className={'flex flex-row items-center gap-2 mb-2'}>
				<a href={`${ETHSCAN}/nft/${LOTTERY_ADDRESS}/${ticket.token}`} target="_blank" rel="noreferrer">
					#{ticket.token}
				</a>

				<div className={'text text-muted-foreground'}>{lines.length} lines</div>
			</div>
			<div className="flex flex-col gap-2 max-h-36 overflow-y-auto justify-start">
				{lines.map((line, index) => (
					<div key={index} className="flex flex-row gap-2 items-center justify-center">
						{line.numbers.map((number, index) => (
							<NumberComponent
								key={index}
								className={cn({
									'stroke-success': winningLine && partlyEquals(line, winningLine, index),
								})}
							>
								{number}
							</NumberComponent>
						))}
						+
						<NumberComponent
							isSymbol
							className={cn({
								'stroke-success': winningLine && line.symbol === winningLine.symbol,
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
