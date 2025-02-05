import { SymbolElement } from '@/src/components/Line.tsx';
import type { ILine } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { Button } from '@betfinio/components/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, ChevronLeft, ShuffleIcon, XCircle } from 'lucide-react';
import { type FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDraftLines } from '../lib/query';
import { isDuplicate, randomize } from '../lib/utils';

const animationDuration = 1000;
const animationInterval = 100;

const EditMode: FC<{ ticket: ILine; onBack: () => void; onSave?: (ticket: ILine) => void; order: number; editMode: boolean }> = ({
	order,
	onBack,
	ticket,
	onSave,
	editMode,
}) => {
	const { t } = useTranslation('lottery', { keyPrefix: 'create.validation' });
	const [symbol, setSymbol] = useState(ticket.symbol);
	const [numbers, setNumbers] = useState(ticket.numbers);
	const { data: draftLines = [] } = useDraftLines();

	useEffect(() => {
		setNumbers(ticket.numbers);
		setSymbol(ticket.symbol);
	}, [ticket]);

	const changeSymbol = (symbol: number) => {
		setSymbol(symbol);
	};
	const toggleNumber = (number: number) => {
		if (numbers.includes(number)) {
			setNumbers(numbers.filter((n) => n !== number));
		} else {
			setNumbers([...new Set([...numbers, number])].filter((e) => e >= 1 && e <= 25));
		}
	};
	const handleRandomize = () => {
		const animateRandomValues = () => {
			const { numbers, symbol } = randomize();
			setNumbers(numbers);
			setSymbol(symbol);
		};

		const interval = setInterval(animateRandomValues, animationInterval);
		setTimeout(() => {
			clearInterval(interval);
			animateRandomValues();
		}, animationDuration);
	};
	const handleClear = () => {
		setNumbers([]);
		setSymbol(0);
	};
	const handleSave = () => {
		onSave?.({ numbers: numbers.sort(), symbol });
	};
	const validation: string = useMemo(() => {
		const sum = numbers.reduce((acc, curr) => acc + curr, 0);
		const newLine = { numbers: numbers, symbol };
		// check if edited line is the same as the ticket
		const isSame = ticket.numbers.length === numbers.length && ticket.numbers.every((n, index) => n === numbers[index]) && ticket.symbol === symbol;
		const duplicates = isSame ? false : isDuplicate([...draftLines, newLine]);

		const actualNumbers = numbers.filter((n) => n !== 0);
		// validate numbers are 5
		if (actualNumbers.length < 5 || sum === 0) return t('remaining', { count: 5 - actualNumbers.length });
		// validate symbol is 1-5
		if (symbol < 1 || symbol > 5) return t('symbol');
		// validate numbers are unique
		if (new Set(numbers).size !== numbers.length) return t('unique');
		// validate numbers are 1-25
		if (numbers.some((n) => n < 1 || n > 25)) return t('1to25');
		// check if numbers length is 5
		if (actualNumbers.length > 5) return t('5numbers');
		// validate duplicates
		if (duplicates) return t('duplicates');
		return '';
	}, [symbol, numbers, ticket]);

	const cardPosition = order % 3 === 1 ? -123 : order % 3 === 2 ? 0 : 123;

	return (
		<motion.div
			initial={{ rotateX: 90, top: 0 }}
			animate={{ rotateX: editMode ? 0 : 90, top: editMode ? 0 : cardPosition }}
			transition={{
				delay: editMode ? 0.2 : 0,
				duration: 0.3,
				ease: 'easeInOut',
			}}
			style={{ transformStyle: 'preserve-3d', pointerEvents: 'auto' }}
			className={'left-0 absolute inset-0 p-4 bg-background-light rounded-xl z-[100] w-full h-full flex flex-col'}
		>
			<nav className={'flex justify-between w-full items-center'}>
				<Button variant={'ghost'} className={'text-foreground'} size={'sm'} onClick={onBack}>
					<ChevronLeft className={'w-5 h-5'} />
					Back to all lines
				</Button>
				<div className={'shiny-gold w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground font-semibold'}>{order}</div>
			</nav>
			<section className={'flex flex-col items-center justify-between h-full '}>
				<div className={'uppercase  font-semibold text-lg flex flex-row gap-1 mt-4'}>
					Pick <span className="text-success text-xl">5</span> numbers +<span className="text-secondary-foreground">symbol</span>
				</div>
				<div className={'w-full gap-4 flex flex-col'}>
					<div className={'grid grid-cols-5 grid-rows-5 grid-flow-col w-full gap-2'}>
						<AnimatePresence mode="wait">
							{Array.from({ length: 25 }).map((_, index) => (
								<motion.div
									key={index}
									onClick={() => toggleNumber(index + 1)}
									animate={
										numbers.length === 5 && numbers.includes(index + 1)
											? {
													boxShadow: ['0 0 0 0 rgba(34,197,94,0)', '0 0 20px 10px rgba(34,197,94,0.7)', '0 0 20px 10px rgba(34,197,94,0.1)'],
													scale: [1, 1.2, 1],
												}
											: {
													boxShadow: ['0 0 0 0 rgba(34,197,94,0)', '0 0 0 0 rgba(34,197,94,0)', '0 0 0 0 rgba(34,197,94,0)'],
													scale: [1, 1, 1],
												}
									}
									transition={{
										duration: 1.6,
										times: [0, 0.5, 0.7],
										ease: 'easeInOut',
										repeat: 0,
									}}
									className={cn(
										'aspect-[4/3] cursor-pointer bg-secondary rounded-lg flex items-center justify-center transition-all border-2 border-transparent',
										{
											'bg-primary text-primary-foreground border-none': numbers.includes(index + 1),
											'bg-success text-success-foreground border-none': numbers.length === 5 && numbers.includes(index + 1),
											'bg-destructive text-destructive-foreground border-none': numbers.length > 5 && numbers.includes(index + 1),
										},
									)}
								>
									{index + 1}
								</motion.div>
							))}
						</AnimatePresence>
					</div>
					<div className="flex flex-row justify-center text-sm text-muted-foreground">The symbol activates with 3 filled lines</div>
					<div className={'grid grid-cols-5 w-full gap-2'}>
						{Array.from({ length: 5 }).map((_, index) => (
							<div
								key={index}
								onClick={() => changeSymbol(index + 1)}
								className={cn(
									'aspect-[4/3] border-2  border-foreground/50 cursor-pointerbg-secondary/90 rounded-lg cursor-pointer flex items-center justify-center transition-all',
									{
										'border-primary border-2  bg-foreground/30 scale-110': symbol === index + 1,
									},
								)}
							>
								<SymbolElement symbol={symbol === index + 1 ? symbol : index + 1} className={'text-2xl'} />
							</div>
						))}
					</div>
				</div>
				<div className={'text-destructive h-6 text-sm'}>{validation}</div>
				<footer className={'grid grid-cols-3 gap-2 w-full items-center'}>
					<Button variant={'ghost'} className={' gap-1 font-light py-0 h-auto'} onClick={handleClear}>
						<XCircle className={'w-3.5 h-3.5'} />
						Clear
					</Button>
					<Button variant={'ghost'} className={' gap-1 font-light py-0 h-auto'} onClick={handleRandomize}>
						<ShuffleIcon className={'w-3.5 h-3.5'} />
						Quick pick
					</Button>
					<Button variant={'success'} className={' gap-1 font-light '} shape={'pill'} size={'sm'} onClick={handleSave} disabled={validation !== ''}>
						<CheckCircle className={'w-3.5 h-3.5'} />
						Save
					</Button>
				</footer>
			</section>
		</motion.div>
	);
};
export default EditMode;
