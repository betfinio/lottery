import { DYNAMIC_STAKING_ADDRESS } from '@/src/globals';
import { useSelectedRound, useTicketPrice } from '@/src/lib/query';
import type { ILine } from '@/src/lib/types';
import { partlyEquals } from '@/src/lib/utils';
import { cn } from '@betfinio/components';
import { useMediaQuery } from '@betfinio/components/hooks';
import { Bag } from '@betfinio/components/icons';
import { BetValue } from '@betfinio/components/shared';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@betfinio/components/ui';
import { useChatbot } from 'betfinio_context/lib/context';
import { useBalance } from 'betfinio_context/lib/query';
import { AlertCircle, AlertTriangleIcon, CircleHelp, XIcon } from 'lucide-react';
import { NumberComponent, SymbolElement } from '../Line';
import Ticket from '../icons/Ticket';
import { JackpotFrame } from './JackpotTiara/JackpotFrame';

const Header = () => {
	const { toggle } = useChatbot();
	const { data: bank = 0n } = useBalance(DYNAMIC_STAKING_ADDRESS);
	const handleReport = () => {
		toggle();
	};
	return (
		<div className={'w-full border border-border rounded-lg bg-background-lighter p-2 md:p-3 lg:p-4 flex flex-row justify-between min-h-[70px] items-center'}>
			<div className="flex flex-row items-center justify-center gap-2 lg:gap-3">
				<Ticket className="w-10 h-10" />
				<div className="flex flex-col gap-0">
					<div>Lotto 5 of 25</div>
					<div className="text-sm text-muted-foreground">Tuesday and Friday</div>
				</div>
				<div className="md:flex flex-row items-center justify-center gap-2 hidden">
					<Bag className="w-10 h-10 text-primary" />
					<div className="flex flex-col gap-0">
						<div className="">Bank</div>
						<BetValue className="text-muted-foreground text-sm" value={(bank * 5n) / 100n} withIcon />
					</div>
				</div>
			</div>
			<div className="flex flex-row items-center justify-center gap-2 lg:gap-3">
				<Dialog>
					<DialogTrigger className={'flex flex-col items-center'}>
						<AlertCircle className={'w-6 h-6'} />
						<span className={'hidden sm:inline text-xs'}>Paytable</span>
					</DialogTrigger>
					<PayoutContent />
				</Dialog>
				<a
					target={'_blank'}
					href={'https://betfin.gitbook.io/betfin-public/v/games-manual/games-guide/predict-game'}
					className={
						'flex flex-col items-center justify-center cursor-pointer text-secondary-foreground hover:text-secondary-foreground lg:text-foreground duration-300'
					}
					rel="noreferrer"
				>
					<CircleHelp className={'w-6 h-6'} />
					<span className={'hidden sm:inline text-xs'}>How to play</span>
				</a>
				<div className={'flex flex-col items-center text-secondary-foreground group lg:text-foreground hover:text-secondary-foreground text-xs cursor-pointer'}>
					<AlertTriangleIcon className={'w-6 h-6'} onClick={handleReport} />
					<span className={'hidden md:block'}>Report</span>
				</div>
			</div>
		</div>
	);
};

function PayoutContent() {
	const { data: selectedRound } = useSelectedRound();
	const { data: price = 0n } = useTicketPrice(selectedRound?.address);
	const { isMobile } = useMediaQuery();
	const correctLine: ILine = {
		numbers: [1, 2, 3, 4, 5],
		symbol: 1,
	};
	const jackpots = [
		{ coef: 40000n, line: correctLine, name: 'Jackpot 1', subtitle: '1 : 265,650' },
		{ coef: 15000n, line: { numbers: [1, 2, 3, 4, 5], symbol: 2 }, name: 'Jackpot 2', subtitle: '1 : 66,412' },
		{ coef: 400n, line: { numbers: [1, 2, 3, 4, 6], symbol: 1 }, name: 'Jackpot 3', subtitle: '1 : 2,656' },
		{ coef: 50n, line: { numbers: [1, 2, 3, 4, 6], symbol: 2 }, name: 'Jackpot 4', subtitle: '1 : 664' },
		{ coef: 5n, line: { numbers: [1, 2, 3, 6, 7], symbol: 1 }, name: 'Jackpot 5', subtitle: '1 : 140' },
		{ coef: 1n, line: { numbers: [1, 2, 3, 6, 7], symbol: 2 }, name: 'Jackpot 6', subtitle: '1 : 35' },
		{ coef: 1n, line: { numbers: [1, 2, 6, 7, 8], symbol: 1 }, name: 'Jackpot 7', subtitle: '1 : 23' },
	];
	return (
		<DialogContent className={'lottery'}>
			<div className={'w-[98vw] md:max-w-[650px] p-2 overflow-y-scroll max-h-[90vh]'}>
				<DialogHeader>
					<DialogTitle className="flex justify-between font-normal p-2 text-xl">
						Winning combinations
						<DialogClose>
							<XIcon className={'w-4 h-4'} />
						</DialogClose>
					</DialogTitle>
					<DialogDescription>
						<div className={'gap-2 text-center items-center'}>
							<div className={'grid grid-cols-4 gap-2 text-center items-center py-2'}>
								<div className={'text-muted-foreground hidden md:block'}>Name</div>
								<div className="col-span-3 md:col-span-2 text-muted-foreground">Combination</div>
								<div className={'text-muted-foreground'}>Payout</div>
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

export default Header;
