import { useDraftLines, useSelectedRound, useTicketPrice } from '@/src/lib/query';
import { EMPTY_LINE, type ILine, RoundState } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { toast } from '@betfinio/components/hooks';
import { BetValue } from '@betfinio/components/shared';
import { Badge, Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';
import { usePrivy } from '@privy-io/react-auth';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, CircleHelp, LockIcon, LockOpenIcon, PencilIcon, PlusCircleIcon, ShuffleIcon, TrashIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useRoundState } from '../lib/query/state.ts';
import { isDuplicate, randomize } from '../lib/utils/index.ts';
import Line from './Line.tsx';
import Alert from './shared/Alert.tsx';
import Pagination from './shared/Pagination';

const CreateTicket = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'create' });
	const { data: round } = useSelectedRound();
	const { state } = useRoundState(round?.address);
	const { data: price = 1000, isLoading, isFetching } = useTicketPrice(round?.address);
	const { data: draftTickets = [] } = useDraftLines();

	const filledLines = draftTickets.filter((line: ILine) => line.numbers.every((number) => number !== 0));
	const symbolUnlocked = filledLines.length >= 3;

	const isDisabled = state !== RoundState.FILLING;

	return (
		<section
			className={cn('w-full md:h-full border border-border rounded-xl p-3  bg-background-lighter relative h-[593px] flex flex-col justify-between', {
				'border-2 border-primary/70 create-shadow bg-background-light': state === RoundState.FILLING,
				'border border-foreground/50': isDisabled,
			})}
		>
			<div className={'uppercase text-secondary-foreground text-lg flex justify-center items-center gap-1'}>
				{isDisabled ? (
					<>
						<LockIcon className="w-4 h-4" />
						Your ticket
					</>
				) : (
					'Fill new ticket'
				)}
			</div>
			<nav className={'flex justify-between'}>
				<div
					className={cn('flex flex-row items-center gap-1', {
						'animate-pulse blur-sm': isLoading || isFetching,
					})}
				>
					<BetValue value={price} withIcon withMillify={false} /> / {t('line')}
				</div>
				<motion.div
					animate={
						symbolUnlocked
							? {
									scale: [1, 1.2, 1],
									textShadow: ['0 0 0 0 hsl(var(--primary))', '0 0 20px 10px hsl(var(--primary))', '0 0 20px 1px hsl(var(--primary))'],
								}
							: {
									scale: 1,
									textShadow: 'none',
								}
					}
					transition={{
						duration: 1.6,
						times: [0, 0.5, 0.6],
						ease: 'easeInOut',
					}}
					className={'text-sm flex flex-row gap-1 items-center font-thin'}
				>
					{symbolUnlocked ? (
						<div className={'flex flex-row gap-1 items-center px-1'}>
							{t('symbolUnlocked')}
							<LockOpenIcon className={'w-3 h-3 text-primary'} />
						</div>
					) : (
						<>
							{t('addMore', { count: 3 - filledLines.length })} <MoreLinesTooltip />
						</>
					)}
				</motion.div>
			</nav>
			<div className={'flex flex-col flex-grow'}>
				<TicketList />
			</div>
		</section>
	);
};

const TicketList = () => {
	const { data: draftTickets = [], setTickets } = useDraftLines();
	const { data: round } = useSelectedRound();
	const { state, updateState } = useRoundState(round?.address);
	const { address } = useAccount();
	const { connectWallet } = usePrivy();

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
				description: 'You can not add more lines',
				variant: 'destructive',
			});
		setTickets([...draftTickets, { numbers: [0, 0, 0, 0, 0], symbol: 0 }]);
	};

	const handleProceed = () => {
		if (!address) {
			connectWallet();
			return;
		}
		if (duplicates) {
			return toast({
				title: 'Error',
				description: 'You can not proceed with duplicate lines',
				variant: 'destructive',
			});
		}
		if (filledLines.length === 0) {
			return toast({
				title: 'Error',
				description: 'You must fill at least one line',
				variant: 'destructive',
			});
		}
		if (filledLines.length !== draftTickets.length) {
			return toast({
				title: 'Error',
				description: 'You must fill all lines',
				variant: 'destructive',
			});
		}
		updateState(RoundState.PLACING);
	};
	const handleEdit = () => {
		updateState(RoundState.FILLING);
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

	const isDisabled = state !== RoundState.FILLING;

	return (
		<AnimatePresence mode={'popLayout'}>
			<div className={'flex flex-col justify-between h-full'}>
				<Pagination
					isLive={true}
					items={draftTickets}
					itemsPerPage={3}
					additionalFooter={
						!isDisabled && (
							<div className={'flex flex-row justify-between'}>
								<Alert
									onSuccess={handleDeleteAll}
									trigger={
										<Button size="sm" variant="ghost" className="py-0 h-auto transition-all hover:scale-[1.2]" shape="pill">
											<TrashIcon className="w-3.5 h-3.5 text-destructive" />
										</Button>
									}
									storageKey="lottery-deleteAll"
									isValid={filledLines.length > 1}
								>
									<div className="flex flex-col">
										<div className="text-lg font-semibold">Do you really want to delete all drafted lines?</div>
										<div className="text-sm text-muted-foreground">This action can not be undone</div>
									</div>
								</Alert>

								<Alert
									onSuccess={handleRandomizeAll}
									trigger={
										<Button size="sm" variant="outline" className="py-0 h-auto border-none transition-all hover:scale-[1.2]" shape="pill">
											<ShuffleIcon className="w-3.5 h-3.5" />
										</Button>
									}
									storageKey="lottery-randomizeAll"
									isValid={filledLines.length > 0}
								>
									<div className="flex flex-col">
										<div className="text-lg font-semibold">Do you want to randomize all lines?</div>
										<div className="text-sm text-muted-foreground">This will replace all your current numbers</div>
									</div>
								</Alert>
							</div>
						)
					}
					className={'flex-grow flex flex-col justify-between'}
					renderItem={(ticket: ILine, index: number) => (
						<Line
							key={index}
							line={ticket}
							order={index + 1}
							onEdit={(newTicket) => updateTicket(index, newTicket)}
							onDelete={() => deleteTicket(index)}
							isDisabled={isDisabled}
							symbolUnlocked={filledLines.length >= 3}
							showDelete={draftTickets.length > 1}
						/>
					)}
				/>

				<footer className={cn('grid grid-cols-2 gap-4')}>
					{isDisabled ? (
						<Button className={'col-span-2 gap-2  border-primary text-secondary-foreground'} variant={'outline'} onClick={handleEdit}>
							<PencilIcon className={'w-3.5 h-3.5'} />
							Edit
						</Button>
					) : (
						<Button
							variant={'outline'}
							className={cn('border-primary text-secondary-foreground gap-1 hover:scale-105 transition-all', {
								'col-span-2': state !== RoundState.FILLING,
							})}
							onClick={handleAddLine}
						>
							<PlusCircleIcon className={'w-4 h-4'} />
							Add line
						</Button>
					)}

					{state === RoundState.FILLING && (
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button className="gap-1 hover:scale-105 transition-all" variant={!address ? 'default' : 'success'} onClick={handleProceed}>
										{address ? (
											<>
												Proceed ({filledLines.length} lines)
												<ArrowRightIcon className={'w-4 h-4'} />
											</>
										) : (
											<>Connect wallet</>
										)}
									</Button>
								</TooltipTrigger>
								{duplicates && (
									<TooltipContent>
										<div>You can not proceed with duplicate lines</div>
									</TooltipContent>
								)}
								{filledLines.length !== draftTickets.length && (
									<TooltipContent>
										<div>You must fill all lines</div>
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
				<TooltipContent className="lottery">
					<div className="max-w-[300px]">{t('addMoreTooltip')}</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export default CreateTicket;
