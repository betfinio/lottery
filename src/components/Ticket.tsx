import type { ITicket } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { Button } from '@betfinio/components/ui';
import { motion } from 'framer-motion';
import { PencilIcon, ShuffleIcon, TrashIcon } from 'lucide-react';
import type { FC, PropsWithChildren } from 'react';

export interface TicketProps {
	ticket: ITicket;
	onDelete?: () => void;
	onEdit: (ticket: ITicket) => void;
	isNew?: boolean;
	order: number;
}

const Ticket: FC<TicketProps> = ({ ticket, isNew = false, order, onEdit, onDelete }) => {
	const handleRandomize = () => {
		// select 5 random unique numbers out of 25
		const numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 25) + 1);
		// select a random symbol
		const symbol = Math.floor(Math.random() * 5) + 1;
		onEdit?.({ numbers, symbol });
	};

	const handleDelete = () => {
		onDelete?.();
	};
	const renderNewFooter = () => {
		return (
			<div className={'flex flex-row px-4 justify-between'}>
				<Button shape={'pill'} size={'sm'} className={'px-4 text-sm py-0 h-auto'}>
					Fill ticket
				</Button>
				<Button variant={'ghost'} className={'py-0 h-auto'} onClick={handleRandomize}>
					Quick pick
				</Button>
			</div>
		);
	};
	const renderRegularFooter = () => {
		return (
			<div className={'flex flex-row  justify-between'}>
				<Button variant="ghost" className={'text-destructive gap-1 font-light py-0 h-auto'} onClick={handleDelete}>
					<TrashIcon className={'w-3.5 h-3.5'} />
					Delete
				</Button>
				<Button variant="ghost" className={'gap-1 text-secondary-foreground font-light py-0 h-auto'}>
					<PencilIcon className={'w-3.5 h-3.5'} />
					Edit
				</Button>
				<Button variant={'ghost'} className={'gap-1 font-light py-0 h-auto'} onClick={handleRandomize}>
					<ShuffleIcon className={'w-3.5 h-3.5'} />
					Quick pick
				</Button>
			</div>
		);
	};
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.7 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.7 }}
			className={'relative overflow-x-hidden'}
		>
			<div className={'bg-secondary border border-purple-box rounded-lg mt-4 py-2 '}>
				<div
					className={
						'absolute top-4 left-1/2 -translate-y-4 flex items-center justify-center text-primary-foreground font-semibold -translate-x-1/2 rounded-full shiny-gold w-8 h-8'
					}
				>
					{order}
				</div>
				<div className={'flex flex-row gap-2 m-2 my-4 items-center justify-center'}>
					{ticket.numbers.map((number, index) => (
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
		</motion.div>
	);
};

const NumberComponent: FC<PropsWithChildren<{ isSymbol?: boolean }>> = ({ children, isSymbol = false }) => {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg height="33" width="33" className={cn({ 'regular-number': !isSymbol, 'symbol-number': isSymbol })}>
			<polygon
				points="10 1, 23 1, 32 10, 32 22,
				23 32, 10 32, 1 23, 1 10"
				fill="currentColor"
				stroke="currentStroke"
				stroke-width="1"
			/>

			<foreignObject width={33} height={30} x={0} y={4.5}>
				<div className={'text-foreground flex items-center justify-center'}>{children}</div>
			</foreignObject>
		</svg>
	);
};

const SymbolElement: FC<{ symbol: number }> = ({ symbol }) => {
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
