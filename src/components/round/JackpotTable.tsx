import { truncateEthAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@betfinio/components/ui';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Address } from 'viem';
import { ETHSCAN } from '@/src/globals';
import { useGetRoundFromParams, useRoundBets, useTicketPrice, useWinningLine } from '@/src/lib/query';
import type { ITicket } from '@/src/lib/types';
import { COMBINATIONS_MAP } from '@/src/lib/utils';
import Ticket from '../icons/Ticket';
import { JackpotFrame } from '../shared/JackpotTiara/JackpotFrame';

interface TierConfig {
	key: keyof typeof COMBINATIONS_MAP;
	coef: number;
	name: string;
	color: string;
}

const TIERS: TierConfig[] = [
	{ key: '5+1', coef: 40_000, name: 'jackpot1', color: 'text-[var(--gold)]' },
	{ key: '5', coef: 15_000, name: 'jackpot2', color: 'text-[var(--gold)]' },
	{ key: '4+1', coef: 400, name: 'jackpot3', color: 'text-[var(--silver)]' },
	{ key: '4', coef: 50, name: 'jackpot4', color: 'text-[var(--silver)]' },
	{ key: '3+1', coef: 5, name: 'jackpot5', color: 'text-[var(--silver)]' },
	{ key: '3', coef: 1, name: 'jackpot6', color: 'text-[var(--bronze)]' },
	{ key: '2+1', coef: 1, name: 'jackpot7', color: 'text-[var(--bronze)]' },
];

interface WinningEntry {
	player: string;
	betAddress: string;
	ticket: ITicket;
}

function getTierKey(ticket: ITicket, winningLine: ITicket): string | null {
	const sameBits = ticket.numbers.filter((n) => winningLine.numbers.includes(n)).length;
	const symbolMatch = ticket.symbol === winningLine.symbol;

	if (sameBits === 5 && symbolMatch) return '5+1';
	if (sameBits === 5) return '5';
	if (sameBits === 4 && symbolMatch) return '4+1';
	if (sameBits === 4) return '4';
	if (sameBits === 3 && symbolMatch) return '3+1';
	if (sameBits === 3) return '3';
	if (sameBits === 2 && symbolMatch) return '2+1';
	return null;
}

export const JackpotTable: FC = () => {
	const { t } = useTranslation('lottery');
	const { t: roundT } = useTranslation('lottery', { keyPrefix: 'round' });
	const roundId = useGetRoundFromParams();
	const { data: winningLine } = useWinningLine(roundId);
	const { data: bets = [] } = useRoundBets(roundId);
	const { data: ticketPrice = 0n } = useTicketPrice();

	const tierData = useMemo(() => {
		if (!winningLine) return new Map<string, WinningEntry[]>();
		const entries = new Map<string, WinningEntry[]>();
		for (const bet of bets) {
			for (const ticket of bet.tickets) {
				const tier = getTierKey(ticket, winningLine);
				if (tier) {
					const list = entries.get(tier) ?? [];
					list.push({ player: bet.player, betAddress: bet.betAddress, ticket });
					entries.set(tier, list);
				}
			}
		}
		return entries;
	}, [bets, winningLine]);

	if (!winningLine) return null;

	return (
		<div>
			<div className="flex gap-2 items-center p-3 text-sm">
				<div className="grid grid-cols-4 w-full text-tertiary-foreground font-semibold">
					<div className="flex gap-4 items-center whitespace-nowrap">{t('jackpot')}</div>
					<div className="flex gap-4 items-center justify-center whitespace-nowrap">{t('combination')}</div>
					<div className="flex gap-4 items-center justify-center whitespace-nowrap">{t('payout')}</div>
					<div className="flex gap-4 items-center justify-center whitespace-nowrap">{t('winners')}</div>
				</div>
				<div className="w-6 h-1" />
			</div>

			<Accordion type="single" collapsible className="w-full gap-3 flex flex-col">
				{TIERS.map((tier) => {
					const winners = tierData.get(tier.key) ?? [];
					const hasNoTickets = winners.length === 0;
					return (
						<AccordionItem key={tier.key} className="p-0 w-full border-none" value={tier.key}>
							<AccordionTrigger
								className={cn('bg-secondary rounded-md flex p-3 h-[72px]', {
									'[&>svg]:opacity-0': hasNoTickets,
								})}
								disabled={hasNoTickets}
							>
								<div className="grid grid-cols-4 w-full">
									<div className="flex gap-2 items-center">
										<div className="w-24 relative">
											<JackpotFrame animateStars className={cn('w-full h-full', tier.color)} />
											<div className="absolute inset-0 flex flex-col items-center justify-center">
												<div className="mt-1.5 text-xs font-semibold">{t(tier.name)}</div>
											</div>
										</div>
									</div>
									<div className="flex gap-4 items-center justify-center whitespace-nowrap">{COMBINATIONS_MAP[tier.key].combination}</div>
									<div className="flex gap-4 items-center justify-center whitespace-nowrap">
										<BetValue withIcon value={ticketPrice * BigInt(tier.coef)} />
									</div>
									<div className="flex gap-1 items-center justify-center whitespace-nowrap">
										{winners.length}
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<span className="cursor-pointer">
														<Ticket className="w-4 h-4 text-primary" />
													</span>
												</TooltipTrigger>
												<TooltipContent>{t('jackpotTableTicketsTooltip', { count: winners.length })}</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</div>
							</AccordionTrigger>
							<AccordionContent className="flex p-0 w-full">
								<div className="w-14 justify-center after:border-l after:border-l-gray-800 after:h-full after:block py-2 hidden md:flex" />
								<div className="mt-2 w-full">
									<WinnersTable winners={winners} payout={ticketPrice * BigInt(tier.coef)} t={roundT} />
								</div>
							</AccordionContent>
						</AccordionItem>
					);
				})}
			</Accordion>
		</div>
	);
};

interface WinnersTableProps {
	winners: WinningEntry[];
	payout: bigint;
	t: (key: string) => string;
}

const WinnersTable: FC<WinnersTableProps> = ({ winners, payout, t }) => {
	if (winners.length === 0) return null;

	return (
		<div className="w-full overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr className="text-muted-foreground">
						<th className="text-left p-2 font-medium">{t('ticketOwner')}</th>
						<th className="text-left p-2 font-medium hidden md:table-cell">{t('betId')}</th>
						<th className="text-right p-2 font-medium">{t('ticketWinning')}</th>
					</tr>
				</thead>
				<tbody>
					{winners.map((entry, i) => (
						<tr key={`${entry.betAddress}-${i}`}>
							<td className="p-2">
								<a href={`${ETHSCAN}/address/${entry.player}`} className="text-bonus" target="_blank" rel="noreferrer">
									{truncateEthAddress(entry.player as Address)}
								</a>
							</td>
							<td className="p-2 hidden md:table-cell">
								<a href={`${ETHSCAN}/address/${entry.betAddress}`} target="_blank" rel="noreferrer">
									{truncateEthAddress(entry.betAddress as Address)}
								</a>
							</td>
							<td className="p-2 text-right">
								<BetValue value={payout} withIcon />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
