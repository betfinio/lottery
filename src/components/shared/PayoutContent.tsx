import { useSelectedRound, useTicketPrice } from '@/src/lib/query';
import type { ILine } from '@/src/lib/types';
import { partlyEquals } from '@/src/lib/utils';
import { cn } from '@betfinio/components';
import { useMediaQuery } from '@betfinio/components/hooks';
import { BetValue } from '@betfinio/components/shared';
import { DialogClose, DialogDescription, DialogTitle } from '@betfinio/components/ui';
import { DialogContent, DialogHeader } from '@betfinio/components/ui';
import { XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NumberComponent, SymbolElement } from '../Line';
import { JackpotFrame } from './JackpotTiara/JackpotFrame';

function PayoutContent() {
	const { t } = useTranslation('lottery');
	const { data: selectedRound } = useSelectedRound();
	const { data: price = 0n } = useTicketPrice(selectedRound?.address);
	const { isMobile } = useMediaQuery();
	const correctLine: ILine = {
		numbers: [1, 2, 3, 4, 5],
		symbol: 1,
	};
	const jackpots = [
		{ coef: 40000n, line: correctLine, name: t('jackpot1'), subtitle: '1 : 265,650' },
		{ coef: 15000n, line: { numbers: [1, 2, 3, 4, 5], symbol: 2 }, name: t('jackpot2'), subtitle: '1 : 66,412' },
		{ coef: 400n, line: { numbers: [1, 2, 3, 4, 6], symbol: 1 }, name: t('jackpot3'), subtitle: '1 : 2,656' },
		{ coef: 50n, line: { numbers: [1, 2, 3, 4, 6], symbol: 2 }, name: t('jackpot4'), subtitle: '1 : 664' },
		{ coef: 5n, line: { numbers: [1, 2, 3, 6, 7], symbol: 1 }, name: t('jackpot5'), subtitle: '1 : 140' },
		{ coef: 1n, line: { numbers: [1, 2, 3, 6, 7], symbol: 2 }, name: t('jackpot6'), subtitle: '1 : 35' },
		{ coef: 1n, line: { numbers: [1, 2, 6, 7, 8], symbol: 1 }, name: t('jackpot7'), subtitle: '1 : 23' },
	];
	return (
		<DialogContent className={'lottery'}>
			<div className={'w-[98vw] md:max-w-[650px] p-2 overflow-y-scroll max-h-[90vh]'}>
				<DialogHeader>
					<DialogTitle className="flex justify-between font-normal p-2 text-xl">
						{t('winningCombinations')}
						<DialogClose>
							<XIcon className={'w-4 h-4'} />
						</DialogClose>
					</DialogTitle>
					<DialogDescription>
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
												'text-gold': jackpot.coef >= 15_000n,
												'text-silver': jackpot.coef >= 5n && jackpot.coef < 15_000n,
												'text-bronze': jackpot.coef >= 1n && jackpot.coef < 5n,
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
														'stroke-success': correctLine && partlyEquals(jackpot.line, correctLine, i),
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
												'stroke-success': correctLine && jackpot.line.symbol === correctLine.symbol,
												'opacity-40': !correctLine || jackpot.line.symbol !== correctLine.symbol,
											})}
										>
											<SymbolElement symbol={jackpot.line.symbol} />
										</NumberComponent>
									</div>
									<div className={'flex flex-col items-center justify-center'}>
										<BetValue value={price * jackpot.coef} withIcon withMillify={isMobile} />
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
