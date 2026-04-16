import { cn } from '@betfinio/components';
import { useMediaQuery } from '@betfinio/components/hooks';
import { BetValue } from '@betfinio/components/shared';
import {
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@betfinio/components/ui';
import { HelpCircleIcon, XIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLotteryCoefficients, useTicketPrice } from '@/src/lib/query';
import type { ITicket } from '@/src/lib/types';
import { partlyEquals, TIER_ORDER, TIER_POSSIBLE_WINNERS } from '@/src/lib/utils';
import { NumberComponent, SymbolElement } from '../Line';
import { JackpotFrame } from './JackpotTiara/JackpotFrame';

function PayoutContent() {
	const { t } = useTranslation('lottery');
	const { data: price = 0n } = useTicketPrice();
	const { data: coefficients = [] } = useLotteryCoefficients();
	const { isMobile } = useMediaQuery();
	const correctLine: ITicket = {
		numbers: [1, 2, 3, 4, 5],
		symbol: 1,
	};
	const jackpots = useMemo(
		() => [
			{ tier: TIER_ORDER[0], coef: coefficients[0] ?? 0n, line: correctLine, name: t('jackpot1'), subtitle: '1 : 265,650' },
			{ tier: TIER_ORDER[1], coef: coefficients[1] ?? 0n, line: { numbers: [1, 2, 3, 4, 5], symbol: 2 }, name: t('jackpot2'), subtitle: '1 : 66,412' },
			{ tier: TIER_ORDER[2], coef: coefficients[2] ?? 0n, line: { numbers: [1, 2, 3, 4, 6], symbol: 1 }, name: t('jackpot3'), subtitle: '1 : 2,656' },
			{ tier: TIER_ORDER[3], coef: coefficients[3] ?? 0n, line: { numbers: [1, 2, 3, 4, 6], symbol: 2 }, name: t('jackpot4'), subtitle: '1 : 664' },
			{ tier: TIER_ORDER[4], coef: coefficients[4] ?? 0n, line: { numbers: [1, 2, 3, 6, 7], symbol: 1 }, name: t('jackpot5'), subtitle: '1 : 140' },
			{ tier: TIER_ORDER[5], coef: coefficients[5] ?? 0n, line: { numbers: [1, 2, 3, 6, 7], symbol: 2 }, name: t('jackpot6'), subtitle: '1 : 35' },
			{ tier: TIER_ORDER[6], coef: coefficients[6] ?? 0n, line: { numbers: [1, 2, 6, 7, 8], symbol: 1 }, name: t('jackpot7'), subtitle: '1 : 23' },
		],
		[coefficients, t],
	);
	return (
		<DialogContent>
			<div className={'w-[98vw] max-w-[384px] md:max-w-[650px] p-2 overflow-y-scroll max-h-[90vh]'}>
				<DialogHeader>
					<DialogTitle className="flex justify-center font-normal p-2 text-xl">
						{t('winningCombinations')}
						<DialogClose className="absolute right-4 top-4">
							<XIcon className={'w-4 h-4'} />
						</DialogClose>
					</DialogTitle>
					<DialogDescription asChild>
						<div className={'gap-2 text-center items-center'}>
							<div className={'grid grid-cols-4 gap-2 text-center items-center py-2'}>
								<div className={'text-muted-foreground hidden md:block'}>{t('name')}</div>
								<div className="col-span-3 md:col-span-2 text-muted-foreground">{t('combination')}</div>
								<div className={'text-muted-foreground'}>{t('payout')}</div>
							</div>
							{jackpots.map((jackpot, index) => (
								<div key={index} className={cn('grid grid-cols-4 gap-2 text-center items-center p-2 rounded-xl', index % 2 === 0 && 'bg-secondary/50')}>
									<div className={'relative hidden md:block'}>
										<JackpotFrame
											animateStars
											className={cn('w-full h-full', {
												'text-[var(--gold)]': jackpot.coef >= 15_000n,
												'text-[var(--silver)]': jackpot.coef >= 5n && jackpot.coef < 15_000n,
												'text-[var(--bronze)]': jackpot.coef >= 1n && jackpot.coef < 5n,
											})}
										/>
										<div className={'absolute top-1 left-0 w-full h-full flex flex-col items-center justify-center'}>
											<div className={' font-semibold'}>{jackpot.name}</div>
											<div className={' font-semibold text-xs text-muted-foreground'}>{jackpot.subtitle}</div>
										</div>
									</div>
									<div className={'col-span-3 md:col-span-2 flex felx-row gap-2 items-center md:mx-5'}>
										{jackpot.line.numbers
											.sort((a, b) => a - b)
											.map((number, i) => (
												<NumberComponent
													key={i}
													className={cn({
														'stroke-success stroke-2': correctLine && partlyEquals(jackpot.line, correctLine, i),
														'opacity-40': !correctLine || !partlyEquals(jackpot.line, correctLine, i),
													})}
												>
													{number || '-'}
												</NumberComponent>
											))}
										+
										<NumberComponent
											isSymbol
											className={cn({
												'stroke-success stroke-2': correctLine && jackpot.line.symbol === correctLine.symbol,
												'opacity-40': !correctLine || jackpot.line.symbol !== correctLine.symbol,
											})}
										>
											<SymbolElement symbol={jackpot.line.symbol} />
										</NumberComponent>
									</div>
									<div className={'flex flex-col items-center justify-center'}>
										<BetValue value={price * jackpot.coef} withIcon withMillify={isMobile} />
										<div className="text-xs text-muted-foreground">x{TIER_POSSIBLE_WINNERS[jackpot.tier]}</div>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger>
													{index === 0 && (
														<div className={'text-xs text-muted-foreground flex flex-row items-center gap-1'}>
															+ <span className={'hidden md:block'}>bonus</span> jackpot <HelpCircleIcon className={'w-3 h-3'} />
														</div>
													)}
												</TooltipTrigger>
												<TooltipContent>
													<div className="max-w-[300px]">Bonus jackpot is 4% of all bets cumulative from all rounds.</div>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</div>
							))}
						</div>
					</DialogDescription>
				</DialogHeader>
			</div>
		</DialogContent>
	);
}

export default PayoutContent;
