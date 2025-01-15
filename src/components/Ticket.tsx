import type { ITicket } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { Button } from '@betfinio/components/ui';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronLeft, PencilIcon, ShuffleIcon, TrashIcon, XCircle } from 'lucide-react';
import { type FC, type PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface TicketProps {
	ticket: ITicket;
	onDelete?: () => void;
	onEdit?: (ticket: ITicket) => void;
	order: number;
	isNew?: boolean;
}

const Ticket: FC<TicketProps> = ({ ticket, order, onEdit, onDelete }) => {
	const [editMode, setEditMode] = useState(false);
	const handleRandomize = () => {
		// generate 5 uniques numbers from 1 to 25
		const numbers = Array.from({ length: 25 }, (_, i) => i + 1) // [1, 2, ..., 25]
			.sort(() => Math.random() - 0.5)
			.slice(0, 5);
		// select a random symbol
		const symbol = Math.floor(Math.random() * 5) + 1;
		onEdit?.({ numbers, symbol });
	};

	const handleDelete = () => {
		onDelete?.();
	};
	const handleEdit = () => {
		setEditMode((prev) => !prev);
	};
	const handleSave = (ticket: ITicket) => {
		onEdit?.(ticket);
		setEditMode(false);
	};
	const isNew = ticket.numbers.every((n) => n === 0) && ticket.symbol === 0;

	return (
		<>
			<motion.div
				initial={{ opacity: 0, scale: 0.7 }}
				animate={{ opacity: 1, scale: 1, rotateX: editMode ? 90 : 0 }}
				exit={{ opacity: 0, scale: 0.7 }}
				transition={{ duration: 0.2, ease: 'easeInOut', delay: editMode ? 0 : 0.2 }}
				style={{ transformStyle: 'preserve-3d' }}
				className={'overflow-x-hidden'}
			>
				<ViewMode ticket={ticket} isNew={isNew} onEditMode={handleEdit} order={order} onDelete={handleDelete} onRandomize={handleRandomize} />
			</motion.div>
			<EditMode ticket={ticket} onBack={handleEdit} onSave={handleSave} order={order} editMode={editMode} onRandomize={handleRandomize} />
		</>
	);
};

const ViewMode: FC<TicketProps & { onRandomize: () => void; onEditMode: () => void }> = ({ ticket, isNew, onEditMode, order, onRandomize, onDelete }) => {
	const renderNewFooter = () => {
		return (
			<div className={'flex flex-row px-4 justify-between'}>
				<Button shape={'pill'} size={'sm'} className={'px-4 text-sm py-0 h-auto'} onClick={onEditMode}>
					Fill ticket
				</Button>
				<Button variant={'ghost'} className={'gap-1 font-light py-0 h-auto'} onClick={onRandomize}>
					<ShuffleIcon className={'w-3.5 h-3.5'} />
					Quick pick
				</Button>
			</div>
		);
	};
	const renderRegularFooter = () => {
		return (
			<div className={'flex flex-row  justify-between'}>
				<Button variant="ghost" className={'text-destructive gap-1 font-light py-0 h-auto'} onClick={onDelete}>
					<TrashIcon className={'w-3.5 h-3.5'} />
					Delete
				</Button>
				<Button variant="ghost" className={'gap-1 text-secondary-foreground font-light py-0 h-auto'} onClick={onEditMode}>
					<PencilIcon className={'w-3.5 h-3.5'} />
					Edit
				</Button>
				<Button variant={'ghost'} className={'gap-1 font-light py-0 h-auto'} onClick={onRandomize}>
					<ShuffleIcon className={'w-3.5 h-3.5'} />
					Quick pick
				</Button>
			</div>
		);
	};
	return (
		<div className={'bg-secondary border border-purple-box rounded-lg mt-4 py-2 '}>
			<div
				className={
					'absolute top-4 left-1/2 -translate-y-4 flex items-center justify-center text-primary-foreground font-semibold -translate-x-1/2 rounded-full shiny-gold w-8 h-8'
				}
			>
				{order}
			</div>
			<div className={'flex flex-row gap-2 m-2 my-4 items-center justify-center'}>
				{ticket.numbers
					.sort((a, b) => a - b)
					.map((number, index) => (
						<NumberComponent key={index}>{number || '-'}</NumberComponent>
					))}
				+
				<NumberComponent isSymbol>
					<SymbolElement symbol={ticket.symbol} />
				</NumberComponent>
			</div>
			<div className={'relative h-5 z-[1]'}>
				<div className={'rounded-full border border-purple-box w-4 h-4 absolute -left-3 bg-background-light z-[2]'} />
				<div className={'rounded-full border border-purple-box w-4 h-4 absolute -right-3 bg-background-light z-[2]'} />
				<div className={'border border-dashed border-t-0 w-full top-2 border-purple-box absolute'} />
			</div>
			{isNew ? renderNewFooter() : renderRegularFooter()}
		</div>
	);
};

const EditMode: FC<{ ticket: ITicket; onBack: () => void; onSave?: (ticket: ITicket) => void; order: number; editMode: boolean; onRandomize: () => void }> = ({
	order,
	onBack,
	ticket,
	onSave,
	onRandomize,
	editMode,
}) => {
	const { t } = useTranslation('lottery', { keyPrefix: 'create.validation' });
	const [symbol, setSymbol] = useState(ticket.symbol);
	const [numbers, setNumbers] = useState(ticket.numbers);

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
		onRandomize();
	};
	const handleClear = () => {
		setNumbers([]);
		setSymbol(0);
	};
	const handleSave = () => {
		onSave?.({ numbers: numbers.sort(), symbol });
	};
	const validation: string = useMemo(() => {
		console.log(symbol, numbers);
		// validate symbol is 1-5
		if (symbol < 1 || symbol > 5) return t('symbol');
		// validate numbers are 5
		if (numbers.length !== 5) return t('5numbers');
		// validate numbers are unique
		if (new Set(numbers).size !== numbers.length) return t('unique');
		// validate numbers are 1-25
		if (numbers.some((n) => n < 1 || n > 25)) return t('1to25');
		return '';
	}, [symbol, numbers]);
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
			className={'left-0 absolute inset-0 p-4 bg-background-light z-[2] rounded-xl  w-full h-full flex flex-col'}
		>
			<nav className={'flex justify-between w-full items-center'}>
				<Button variant={'ghost'} className={'text-foreground'} size={'sm'} onClick={onBack}>
					<ChevronLeft className={'w-5 h-5'} />
					Back to all lines
				</Button>
				<div className={'shiny-gold w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground font-semibold'}>{order}</div>
			</nav>
			<section className={'flex flex-col items-center justify-between h-full '}>
				<h2 className={'uppercase text-secondary-foreground font-semibold text-lg'}>LOTTO ticket</h2>
				<span className={'text-sm text-muted-foreground'}>Select 5 lucky numbers and 1 symbol</span>
				<div className={'w-full'}>
					<div className={'grid grid-cols-5 w-full gap-2'}>
						{Array.from({ length: 5 }).map((_, index) => (
							<div
								key={index}
								onClick={() => changeSymbol(index + 1)}
								className={cn('aspect-[4/3] cursor-pointer bg-foreground/50 rounded-lg flex items-center justify-center transition-all', {
									'border-2': symbol === index + 1,
								})}
							>
								<SymbolElement symbol={index + 1} />
							</div>
						))}
						{Array.from({ length: 5 }).map((_, index) => (
							<div
								key={index}
								onClick={() => changeSymbol(index + 1)}
								className={cn('cursor-pointer text-muted-foreground flex items-center justify-center transition-all')}
							>
								{index + 1}
							</div>
						))}
					</div>
					<div className={'grid grid-cols-5 grid-rows-5 grid-flow-col w-full gap-2'}>
						{Array.from({ length: 25 }).map((_, index) => (
							<div
								key={index}
								onClick={() => toggleNumber(index + 1)}
								className={cn('aspect-[4/3] cursor-pointer bg-secondary rounded-lg flex items-center justify-center transition-all', {
									'border-2 bg-white/10': numbers.includes(index + 1),
								})}
							>
								{index + 1}
							</div>
						))}
					</div>
				</div>
				<div className={'text-destructive/50 h-6'}>{validation}</div>
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

export const NumberComponent: FC<PropsWithChildren<{ isSymbol?: boolean }>> = ({ children, isSymbol = false }) => {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg height="33" width="33" className={cn({ 'regular-number': !isSymbol, 'symbol-number': isSymbol })}>
			<polygon
				points="10 1, 23 1, 32 10, 32 22,
				23 32, 10 32, 1 23, 1 10"
				fill="currentColor"
				stroke="currentStroke"
				strokeWidth="1"
			/>

			<foreignObject width={33} height={30} x={0} y={4.5}>
				<div className={'text-foreground flex items-center justify-center'}>{children}</div>
			</foreignObject>
		</svg>
	);
};

export const SymbolElement: FC<{ symbol: number }> = ({ symbol }) => {
	switch (symbol) {
		case 1:
			return '🍒';
		case 2:
			return '🍊';
		case 3:
			return '🍋';
		case 4:
			return '🍉';
		case 5:
			return '🍇';
		default:
			return '-';
	}
};

export default Ticket;
