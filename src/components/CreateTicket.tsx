import { useDraftLines, useSelectedRound, useTicketPrice } from '@/src/lib/query';
import { EMPTY_LINE, type ILine, RoundState } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { toast } from '@betfinio/components/hooks';
import { BetValue } from '@betfinio/components/shared';
import { Badge, Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, CircleHelp, LockOpenIcon, PlusCircleIcon, ShuffleIcon, TrashIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRoundState } from '../lib/gql/state.ts';
import { isDuplicate, randomize } from '../lib/utils/index.ts';
import Line from './Line.tsx';
import Pagination from './shared/Pagination';

const CreateTicket = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'create' });
	const { data: round } = useSelectedRound();
	const { state } = useRoundState(round?.address);
	const { data: price = 1000, isLoading, isFetching } = useTicketPrice(round?.address);
	const { data: draftTickets = [] } = useDraftLines();

	const filledLines = draftTickets.filter((line: ILine) => line.numbers.every((number) => number !== 0));
	const symbolUnlocked = filledLines.length >= 3;

	return (
		<motion.section
			className={cn('w-full md:h-full border border-border rounded-xl p-3 bg-background-light relative h-[593px] flex flex-col justify-between', {
				'border-2 border-primary/70 create-shadow': state === RoundState.FILLING,
			})}
		>
			<div className={'uppercase text-secondary-foreground text-lg flex justify-center'}>Fill new ticket</div>
			<nav className={'flex justify-between'}>
				<div
					className={cn('flex flex-row items-center gap-1', {
						'animate-pulse blur-sm': isLoading || isFetching,
					})}
				>
					<BetValue value={price} withIcon withMillify={false} /> / {t('line')}
				</div>
				<div className={'text-sm flex flex-row gap-1 items-center font-thin'}>
					{symbolUnlocked ? (
						<motion.div
							initial={{
								opacity: 1,
								scale: 1.5,
								shadow: '0 0 20px 10px rgba(255, 215, 0, 0.5)',
								borderRadius: '4px',
							}}
							animate={{
								opacity: 1,
								scale: 1,
								shadow: 'none',
								borderRadius: '4px',
							}}
							transition={{ duration: 1, ease: 'easeInOut', delay: 0.2 }}
							className={'flex flex-row gap-1 items-center px-1'}
						>
							{t('symbolUnlocked')}
							<LockOpenIcon className={'w-3 h-3 text-primary'} />
						</motion.div>
					) : (
						<>
							{t('addMore', { count: 3 - filledLines.length })} <MoreLinesTooltip />
						</>
					)}
				</div>
			</nav>
			<div className={'flex flex-col flex-grow'}>
				<TicketList />
			</div>
		</motion.section>
	);
};

const TicketList = () => {
	const { data: draftTickets = [], setTickets } = useDraftLines();
	const { data: round } = useSelectedRound();
	const { state, updateState } = useRoundState(round?.address);

	const updateTicket = (index: number, newTicket: ILine) => {
		const updatedTickets = [...draftTickets];
		updatedTickets[index] = newTicket;
		setTickets(updatedTickets);
	};

	const deleteTicket = (index: number) => {
		if (draftTickets.length === 1) {
			setTickets([EMPTY_LINE]);
			return;
		}
		const updatedTickets = draftTickets.filter((_: ILine, i: number) => i !== index);
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
	};

	const handleProceed = () => {
		updateState(RoundState.PLACING);
	};

	const filledLines = draftTickets.filter((line: ILine) => line.numbers.every((number) => number !== 0));
	// Check that there are no same lines with same numbers(sort by numbers) and symbol
	const duplicates = isDuplicate(filledLines);

	const handleDeleteAll = () => {
		setTickets([EMPTY_LINE]);
	};
	const handleRandomizeAll = () => {
		setTickets(draftTickets.map(() => randomize()));
	};
	return (
		<AnimatePresence mode={'popLayout'}>
			<div className={'flex flex-col justify-between h-full'}>
				<Pagination
					items={draftTickets}
					itemsPerPage={3}
					additionalFooter={
						<div className={'flex flex-row justify-between'}>
							<Button size="sm" variant="ghost" className="py-0 h-auto" shape="pill" onClick={handleDeleteAll}>
								<TrashIcon className="w-3.5 h-3.5 text-destructive" />
							</Button>
							<Button size="sm" variant="ghost" className="py-0 h-auto" shape="pill" onClick={handleRandomizeAll}>
								<ShuffleIcon className="w-3.5 h-3.5 text-primary" />
							</Button>
						</div>
					}
					className={'flex-grow'}
					renderItem={(ticket: ILine, index: number) => (
						<Line
							key={index}
							line={ticket}
							order={index + 1}
							onEdit={(newTicket) => updateTicket(index, newTicket)}
							onDelete={() => deleteTicket(index)}
							symbolUnlocked={filledLines.length >= 3}
							showDelete={filledLines.length > 1}
						/>
					)}
				/>

				<footer className={cn('grid grid-cols-2 gap-2')}>
					<Button
						variant={'outline'}
						className={cn('border-primary text-secondary-foreground gap-1', { 'col-span-2': state !== RoundState.FILLING })}
						onClick={handleAddLine}
					>
						<PlusCircleIcon className={'w-4 h-4'} />
						Add line
					</Button>
					{state === RoundState.FILLING && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger>
									<Button variant={'success'} className="gap-1" onClick={handleProceed} disabled={filledLines.length === 0 || duplicates}>
										Proceed ({filledLines.length} lines)
										<ArrowRightIcon className={'w-4 h-4'} />
									</Button>
								</TooltipTrigger>
								{duplicates && (
									<TooltipContent>
										<div>You cannot proceed with duplicate lines</div>
									</TooltipContent>
								)}
							</Tooltip>
						</TooltipProvider>
					)}
				</footer>
			</div>
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
