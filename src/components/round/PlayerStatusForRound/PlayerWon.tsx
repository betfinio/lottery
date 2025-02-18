import { useGetRoundFromParams, useRoundTicketsByPlayer, useWinningLine } from '@/src/lib/query';
import type { ILine, IRoundTicket } from '@/src/lib/types';
import { ZeroAddress } from '@betfinio/abi';
import { BetValue } from '@betfinio/components/shared';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { CopyLocation } from '../../shared/CopyLocation';
import { JackpotFrame } from '../../shared/JackpotTiara/JackpotFrame';
import Pagination from '../../shared/Pagination';
import { TicketCard } from '../../shared/TicketCard';

export const itemsList = [
	{
		betAddress: '0x123',
		lines: [
			{ symbol: 1, numbers: [1, 2, 3, 4, 5] },
			// { symbol: 2, numbers: [1, 2, 3, 4, 5] },
			// { symbol: 2, numbers: [1, 2, 3, 4, 5] },
			// { symbol: 2, numbers: [1, 2, 3, 4, 5] },
			// { symbol: 2, numbers: [1, 2, 3, 4, 5] },
		],
		player: '0x123',
		round: '0x123',
		token: 1,
	},
	{
		betAddress: '0x1234',
		lines: [
			{ symbol: 3, numbers: [1, 12, 3, 14, 5] },
			{ symbol: 4, numbers: [1, 12, 13, 4, 5] },
		],
		player: '0x123',
		round: '0x123',
		token: 12,
	},
	{
		betAddress: '0x1234',
		lines: [
			{ symbol: 3, numbers: [1, 12, 3, 14, 5] },
			{ symbol: 4, numbers: [1, 12, 13, 4, 5] },
		],
		player: '0x123',
		round: '0x123',
		token: 12,
	},
] as IRoundTicket[];

interface PlayerWonProps {
	winningLine: ILine | null | undefined;
	winningCoef: bigint;
	tickets: IRoundTicket[];
	placedAmount: bigint;
	winingAmount: bigint;
}
export const PlayerWon: FC<PlayerWonProps> = ({ winningLine, winningCoef, tickets, placedAmount, winingAmount }) => {
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const multiplier = Number(winingAmount) / Number(placedAmount);

	const applyPagination = tickets.length > 1;
	return (
		<div className="min-h-[430px] mt-[111px] min-w-[388px]">
			<div className="border-2 border-aura rounded-lg relative pt-[104px] px-8 shadow-[0_0_10px_0] shadow-aura flex flex-col h-full">
				{/* Tiara */}
				<div className="absolute h-[208px] w-[320px] -top-[104px] left-1/2 -translate-x-1/2">
					<div className="relative">
						<JackpotFrame animateStars className="text-gold " />

						<div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
							<div>{t('youWon')}</div>
							<BetValue className="text-secondary-foreground text-lg font-bold" value={winingAmount} withMillify={false} />
						</div>
					</div>
				</div>
				{/* Info */}
				<div className="flex gap-2 text-xs justify-between mb-4 text-muted-foreground items-center">
					<div className="flex flex-col items-center">
						<div>{t('betSize')}</div>
						<div className="text-secondary-foreground">
							<BetValue className="text-secondary-foreground" value={placedAmount} withIcon withMillify={false} />
						</div>
					</div>
					<div className="flex flex-col items-center">
						<div>{t('multiplicator')}</div>
						<div>x {multiplier.toFixed(2)}</div>
					</div>
					<div className="text-base">
						<div className="flex items-center gap-2">
							<CopyLocation toastMessage={t('copiedCurrentRoundRef')} className="w-4 h-4" />
							<div>{t('share')}</div>
						</div>
					</div>
				</div>
				{/* Tickets */}
				<div className="flex-grow relative flex flex-col">
					{applyPagination ? (
						<div className="flex-grow flex-col flex">
							{' '}
							<div className="text-muted-foreground text-base mb-2">{t('yourWinningTickets')}</div>
							<Pagination
								items={tickets}
								itemsPerPage={1}
								renderItem={(ticket: IRoundTicket, index: number) => <TicketCard ticket={ticket} winningLine={winningLine} />}
								className="flex-grow h-auto"
							/>
						</div>
					) : (
						<div className="flex flex-col gap-2 justify-center">
							<div className="text-muted-foreground text-base mb-2">{t('yourWinningTickets')}</div>
							{tickets.map((ticket: IRoundTicket, index: number) => (
								<TicketCard key={index} ticket={ticket} winningLine={winningLine} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
