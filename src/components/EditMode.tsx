import { cn } from '@betfinio/components';
import { Button } from '@betfinio/components/ui';
import { CheckCircle, ChevronLeft, ShuffleIcon, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { type FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ITicket } from '@/src/lib/types.ts';
import { useDraftTickets } from '../lib/query';
import { isDuplicate, randomize } from '../lib/utils';
import { AnimatedGridOfNumbners } from './shared/AnimatedGridOfNumbners';
import { TicketGridOfSymbols } from './shared/TicketGridOfSymbols';

const animationDuration = 1000;
const animationInterval = 100;

const EditMode: FC<{
	ticket: ITicket;
	roundId?: bigint;
	onSave?: (ticket: ITicket) => void;
	order: number;
	editMode: boolean;
}> = ({ order, ticket, onSave, editMode }) => {
	const { t } = useTranslation('lottery');
	const [symbol, setSymbol] = useState(ticket.symbol);
	const [numbers, setNumbers] = useState(ticket.numbers);
	const { data: draftTickets = [] } = useDraftTickets();

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
		setNumbers([0, 0, 0, 0, 0]);
		setSymbol(0);
	};
	const handleBack = () => {
		onSave?.({ numbers: numbers.sort(), symbol });
	};
	const handleSave = () => {
		onSave?.({ numbers: numbers.sort(), symbol });
	};
	const validation: string = useMemo(() => {
		const sum = numbers.reduce((acc, curr) => acc + curr, 0);
		const newTicket = { numbers: numbers, symbol };
		// check if edited ticket is the same as the ticket
		const isSame = ticket.numbers.length === numbers.length && ticket.numbers.every((n, index) => n === numbers[index]) && ticket.symbol === symbol;

		const filledTickets = draftTickets.filter((t) => t.numbers.every((n) => n > 0) && t.symbol > 0);

		const duplicates = isSame ? false : isDuplicate([...filledTickets, newTicket]);

		const actualNumbers = numbers.filter((n) => n !== 0);
		// validate numbers are 5
		if (actualNumbers.length < 5 || sum === 0) return t('validatation.remaining', { count: 5 - actualNumbers.length });
		// validate symbol is 1-5
		if (symbol < 1 || symbol > 5) return t('validatation.symbol');
		// validate numbers are unique
		if (new Set(numbers).size !== numbers.length) return t('validatation.unique');
		// validate numbers are 1-25
		if (numbers.some((n) => n < 1 || n > 25)) return t('validatation.1to25');
		// check if numbers length is 5
		if (actualNumbers.length > 5) return t('validatation.5numbers');
		// validate duplicates
		if (duplicates) return t('validatation.duplicates');
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
			className={'left-0 absolute inset-0 p-2 md:p-4 bg-background rounded-xl z-10 w-full h-full flex flex-col'}
		>
			<nav className={'flex justify-between w-full items-center'}>
				<Button variant={'ghost'} className={'text-foreground'} size={'sm'} onClick={handleBack}>
					<ChevronLeft className={'w-5 h-5'} />
					{t('backToAllTickets')}
				</Button>
				<div
					className={cn(
						'shiny-gold w-7 h-7 rounded-full flex items-center justify-center text-primary-foreground font-semibold absolute -top-3.5 left-1/2 -ml-3',
					)}
				>
					{order}
				</div>
			</nav>
			<section className={'flex flex-col items-center justify-between h-full w-full '}>
				<div className={'uppercase font-semibold text-lg flex flex-row gap-1 mt-4'}>
					{t('pick')} <span className="text-success text-xl">5</span> {t('numbers')} +<span className="text-secondary-foreground">{t('symbol')}</span>
				</div>
				<div className={'gap-2 md:gap-4 flex flex-col justify-between w-full max-w-[360px]'}>
					<AnimatedGridOfNumbners numbers={numbers} toggleNumber={toggleNumber} />
					<div className="flex flex-row justify-center text-sm text-muted-foreground">{t('symbolActivatesWith3FilledTickets')}</div>
					<TicketGridOfSymbols symbol={symbol} numbers={numbers} changeSymbol={changeSymbol} />
				</div>
				<div className={'text-destructive h-6 text-sm py-1'}>{validation}</div>
				<footer className={'grid grid-cols-3 gap-2 w-full items-center'}>
					<Button variant={'outline'} className={' gap-1 font-light py-0 px-0 h-auto border-none hover:scale-105 transition-all'} onClick={handleClear}>
						<XCircle className={'w-3.5 h-3.5'} />
						{t('clear')}
					</Button>
					<Button variant={'outline'} className={' gap-1 font-light py-0 px-0 h-auto border-none hover:scale-105 transition-all'} onClick={handleRandomize}>
						<ShuffleIcon className={'w-3.5 h-3.5'} />
						{t('quickPick')}
					</Button>
					<Button
						variant={'success'}
						className={' gap-1 font-light hover:scale-105 transition-all'}
						shape={'pill'}
						size={'sm'}
						onClick={handleSave}
						disabled={validation !== ''}
					>
						<CheckCircle className={'w-3.5 h-3.5'} />
						{t('save')}
					</Button>
				</footer>
			</section>
		</motion.div>
	);
};
export default EditMode;
