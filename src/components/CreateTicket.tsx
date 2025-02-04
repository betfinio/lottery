import { useDraftLines, useSelectedRound, useTicketPrice } from '@/src/lib/query';
import type { ILine } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { toast } from '@betfinio/components/hooks';
import { BetValue } from '@betfinio/components/shared';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CircleCheck, CircleHelp } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Line from './Line.tsx';

const CreateTicket = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'create' });
	const { data: round } = useSelectedRound();
	const { data: price = 1000, isLoading, isFetching } = useTicketPrice(round?.address);
	const { data: draftTickets = [] } = useDraftLines();

	const symbolUnlocked = draftTickets.length >= 3;

	return (
		<section className={'w-full md:h-full border-2 border-primary/70 rounded-xl p-3 bg-background-light col-span-3 md:col-span-1 create-shadow relative'}>
			<div className={'uppercase text-secondary-foreground text-lg flex justify-center'}>Fill new ticket</div>
			<nav className={'flex justify-between'}>
				<div className={cn('flex flex-row items-center gap-1', { 'animate-pulse blur-sm': isLoading || isFetching })}>
					<BetValue value={price} withIcon withMillify={false} /> / {t('line')}
				</div>
				<div className={'text-sm flex flex-row gap-1 items-center font-thin'}>
					{symbolUnlocked ? (
						<>
							{t('symbolUnlocked')} <CircleCheck className={'w-4 h-4 text-success'} />
						</>
					) : (
						<>
							{t('addMore', { count: 3 - draftTickets.length })} <MoreLinesTooltip />
						</>
					)}
				</div>
			</nav>
			<div className={'flex flex-col'}>
				<TicketList />
			</div>
		</section>
	);
};

const TicketList = () => {
	const { data: draftTickets = [], setTickets } = useDraftLines();
	const [offset, setOffset] = useState(0);

	const handleNext = () => {
		if (offset + 3 >= draftTickets.length) return;
		setOffset((prev) => prev + 3);
	};

	const handlePrev = () => {
		if (offset === 0) return;
		setOffset((prev) => prev - 3);
	};

	const updateTicket = (index: number, newTicket: ILine) => {
		const updatedTickets = [...draftTickets];
		updatedTickets[index] = newTicket;
		setTickets(updatedTickets);
	};
	const deleteTicket = (index: number) => {
		if (draftTickets.length === 1)
			return toast({
				title: 'Error',
				description: 'You cannot delete the only ticket',
				variant: 'destructive',
			});
		const updatedTickets = draftTickets.filter((_, i) => i !== index);
		setTickets(updatedTickets);
	};

	const handleAddLine = () => {
		if (draftTickets.length >= 9)
			return toast({
				title: 'Error',
				description: 'You cannot add more lines',
				variant: 'destructive',
			});
		setTickets([...draftTickets, { numbers: [0, 0, 0, 0, 0], symbol: 0 }]);
		setOffset(Math.floor(draftTickets.length / 3) * 3);
	};
	const soon = () => {
		toast({
			title: 'Coming soon',
			description: 'This feature is not available yet',
			variant: 'soon',
		});
	};

	return (
		<AnimatePresence mode={'popLayout'}>
			<div className={'grid md:grid-rows-3 gap-2'} key={'list'}>
				{draftTickets.slice(offset, offset + 3).map((ticket, index) => (
					<Line
						key={index + offset}
						line={ticket}
						order={index + 1 + offset}
						onEdit={(newTicket) => updateTicket(index + offset, newTicket)}
						onDelete={() => deleteTicket(index + offset)}
						symbolUnlocked={draftTickets.length >= 3}
					/>
				))}
			</div>
			<div className={'flex flex-row justify-between py-2 items-center h-10'} key={'navigation'}>
				<ChevronLeft className={cn('w-5 h-5 cursor-pointer', offset === 0 && 'text-muted-foreground')} onClick={handlePrev} />
				<div className={'flex flex-row gap-1'}>
					{Array.from({ length: Math.ceil(draftTickets.length / 3) }).map((_, i) => (
						<div
							key={i}
							className={cn(
								'rounded-md w-6 h-6 flex items-center justify-center text-sm ',
								i === Math.floor(offset / 3) ? 'text-foreground' : 'text-muted-foreground',
							)}
						>
							{i + 1}
						</div>
					))}
				</div>
				<ChevronRight className={cn('w-5 h-5 cursor-pointer', offset + 3 >= draftTickets.length && 'text-muted-foreground')} onClick={handleNext} />
			</div>
			<footer className={cn('grid grid-cols-2 gap-2')}>
				<Button variant={'secondary'} className={'cursor-not-allowed'} onClick={soon}>
					New ticket
				</Button>
				<Button variant={'outline'} className={'border-primary text-secondary-foreground'} onClick={handleAddLine}>
					Add line
				</Button>
			</footer>
		</AnimatePresence>
	);
};

const MoreLinesTooltip = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'create' });
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<CircleHelp className={'w-4 h-4 fill-foreground text-background'} />
				</TooltipTrigger>
				<TooltipContent>
					<div>{t('addMoreTooltip')}</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export default CreateTicket;
