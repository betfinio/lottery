import EditMode from '@/src/components/EditMode.tsx';
import type { ILine } from '@/src/lib/types.ts';
import { randomize } from '@/src/lib/utils';
import { cn } from '@betfinio/components';
import { Button } from '@betfinio/components/ui';
import { motion } from 'framer-motion';
import { LockIcon, PencilIcon, ShuffleIcon, TrashIcon } from 'lucide-react';
import { type FC, type PropsWithChildren, useEffect, useState } from 'react';
import SharedLine from './shared/SharedLine';

export interface LineProps {
	line: ILine;
	onDelete?: () => void;
	onEdit?: (ticket: ILine) => void;
	order: number;
	symbolUnlocked?: boolean;
	isNew?: boolean;
	showDelete?: boolean;
	isDisabled?: boolean;
}

const Line: FC<LineProps> = ({ line: ticket, order, onEdit, onDelete, symbolUnlocked = false, showDelete = true, isDisabled = false }) => {
	const [editMode, setEditMode] = useState(false);
	const handleRandomize = () => {
		onEdit?.(randomize());
	};

	const handleDelete = () => {
		onDelete?.();
	};
	const handleEdit = () => {
		setEditMode((prev) => !prev);
	};
	const handleSave = (ticket: ILine) => {
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
				<ViewMode
					line={ticket}
					isNew={isNew}
					onEditMode={handleEdit}
					order={order}
					isDisabled={isDisabled}
					onDelete={handleDelete}
					onRandomize={handleRandomize}
					symbolUnlocked={symbolUnlocked}
					showDelete={showDelete}
				/>
			</motion.div>
			<EditMode ticket={ticket} onBack={handleEdit} onSave={handleSave} order={order} editMode={editMode} />
		</>
	);
};

const ViewMode: FC<LineProps & { onRandomize: () => void; onEditMode: () => void }> = ({
	line: ticket,
	isNew,
	onEditMode,
	order,
	onRandomize,
	onDelete,
	symbolUnlocked = false,
	showDelete = true,
	isDisabled = false,
}) => {
	const renderNewFooter = () => {
		return (
			<div className={'grid grid-cols-3 px-2'}>
				<Button shape={'pill'} size={'sm'} className={'px-4 text-sm py-0 h-auto'} onClick={onEditMode}>
					Fill line
				</Button>
				<Button variant={'outline'} className={'gap-1 font-light py-0 h-auto border-none'} onClick={onRandomize}>
					<ShuffleIcon className={'w-3.5 h-3.5'} />
					Quick pick
				</Button>
				{showDelete ? (
					<Button variant="ghost" className={'text-destructive gap-1 font-light py-0 h-auto'} onClick={onDelete}>
						<TrashIcon className={'w-3.5 h-3.5'} />
						Delete
					</Button>
				) : (
					<div />
				)}
			</div>
		);
	};
	const renderRegularFooter = () => {
		return (
			<div className={cn('grid grid-cols-3 px-2', { 'grayscale pointer-events-none opacity-50': isDisabled })}>
				<Button variant="ghost" className={'gap-1 text-secondary-foreground font-light py-0 h-auto'} onClick={onEditMode}>
					<PencilIcon className={'w-3.5 h-3.5'} />
					Edit
				</Button>
				<Button variant={'outline'} className={'gap-1 font-light py-0 h-auto border-none'} onClick={onRandomize}>
					<ShuffleIcon className={'w-3.5 h-3.5'} />
					Quick pick
				</Button>
				<Button variant="outline" className={'text-destructive gap-1 font-light py-0 h-auto border-none'} onClick={onDelete}>
					<TrashIcon className={'w-3.5 h-3.5'} />
					Delete
				</Button>
			</div>
		);
	};

	return (
		<div className={cn('bg-secondary border border-purple-box rounded-lg mt-4 py-2 ')}>
			<div
				className={
					'absolute top-4 left-1/2 -translate-y-4 flex items-center justify-center text-primary-foreground font-semibold -translate-x-1/2 rounded-full shiny-gold w-8 h-8'
				}
			>
				{order}
			</div>

			<SharedLine
				line={ticket}
				symbolUnlocked={symbolUnlocked}
				className={'flex flex-row gap-2 m-2 my-4 items-center justify-center'}
				symbolClassName={cn('stroke-primary text-primary/30', {
					'stroke-primary text-primary/30': symbolUnlocked,
					'stroke-foreground text-foreground/30 grayscale': !symbolUnlocked,
				})}
			/>

			<div className={'relative h-5 z-[1]'}>
				<div className={'rounded-full border border-purple-box w-4 h-4 absolute -left-3 bg-background-light z-[2]'} />
				<div className={'rounded-full border border-purple-box w-4 h-4 absolute -right-3 bg-background-light z-[2]'} />
				<div className={'border border-dashed border-t-0 w-full top-2 border-purple-box absolute'} />
			</div>
			{isNew ? renderNewFooter() : renderRegularFooter()}
		</div>
	);
};

export const NumberComponent: FC<PropsWithChildren<{ isSymbol?: boolean; className?: string }>> = ({ children, isSymbol = false, className = '' }) => {
	return (
		// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
		<svg height="33" width="33" className={cn({ 'regular-number': !isSymbol, 'symbol-number': isSymbol }, className)}>
			<polygon
				points="10 1, 23 1, 32 10, 32 22,
				23 32, 10 32, 1 23, 1 10"
				fill="currentColor"
				stroke="currentStroke"
				strokeWidth="1"
			/>

			<foreignObject width={33} height={33} x={0} y={0}>
				<div className={'text-foreground flex items-center h-[33px] justify-center'}>{children}</div>
			</foreignObject>
		</svg>
	);
};

export const SymbolElement: FC<{ symbol: number; className?: string }> = ({ symbol, className = '' }) => {
	const getSymbol = () => {
		//🎰🍦🍀🛩️🐥
		switch (symbol) {
			case 1:
				return '🎰';
			case 2:
				return '🍦';
			case 3:
				return '🍀';
			case 4:
				return '🛩️';
			case 5:
				return '🐥';
			default:
				return '-';
		}
	};
	return <motion.div className={cn('text-secondary-foreground', className)}>{getSymbol()}</motion.div>;
};

export default Line;
