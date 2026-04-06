import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, toast } from '@betfinio/components/ui';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowRightIcon, CircleHelp, LockIcon, LockOpenIcon, PencilIcon, PlusCircleIcon, ShuffleIcon, TrashIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useDraftTickets, useSelectedRound, useTicketPrice } from '@/src/lib/query';
import { useRoundState } from '@/src/lib/query/state.ts';
import { EMPTY_TICKET, type ITicket, RoundState } from '@/src/lib/types.ts';
import { isDuplicate, randomize } from '../lib/utils/index.ts';
import { AddMoreLinesText } from './AddMoreLinesText.tsx';
import Line from './Line.tsx';
import Alert from './shared/Alert.tsx';
import Pagination from './shared/Pagination';

const CreateTicket = () => {
	const { t } = useTranslation('lottery');
	const { data: selectedRoundId } = useSelectedRound();
	const { state } = useRoundState(selectedRoundId);
	const { data: price = 1000, isLoading, isFetching } = useTicketPrice();
	const { data: draftTickets = [] } = useDraftTickets();

	const filledTickets = draftTickets.filter((ticket: ITicket) => ticket.numbers.every((number) => number !== 0));
	// In v2, symbol is always unlocked (no minimum lines requirement)
	const symbolUnlocked = true;

	const isDisabled = state !== RoundState.FILLING;

	return (
		<section
			className={cn('w-full md:h-full border border-border rounded-xl p-3  bg-background-lighter relative h-[593px] flex flex-col justify-between', {
				'border-2 border-primary bg-background-light': state === RoundState.FILLING,
				'border border-foreground/50': isDisabled,
			})}
		>
			<div className={'uppercase text-secondary-foreground text-lg flex justify-center items-center gap-1'}>
				{isDisabled ? (
					<>
						<LockIcon className="w-4 h-4" />
						{t('yourTicket')}
					</>
				) : (
					t('fillNewTicket')
				)}
			</div>
			<nav className={'flex justify-between'}>
				<div
					className={cn('flex flex-row items-center gap-1', {
						'animate-pulse blur-xs': isLoading || isFetching,
					})}
				>
					<BetValue value={price} withIcon withMillify={false} /> / {t('create.ticket')}
				</div>
				<motion.div
					animate={
						symbolUnlocked
							? {
									scale: [1, 1.2, 1],
									textShadow: ['0 0 0 0 var(--primary)', '0 0 20px 10px var(--primary)', '0 0 20px 1px var(--primary)'],
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
							{t('create.symbolUnlocked')}
							<LockOpenIcon className={'w-3 h-3 text-primary'} />
						</div>
					) : (
						<>
							{t('create.addMore', { count: 3 - filledTickets.length })} <MoreLinesTooltip />
						</>
					)}
				</motion.div>
			</nav>
			<div className={'flex flex-col grow'}>
				<TicketList />
			</div>
		</section>
	);
};

const TicketList = () => {
	const { t } = useTranslation('lottery');
	const { data: draftTickets = [], setTickets } = useDraftTickets();
	const { data: selectedRoundId } = useSelectedRound();
	const { state, updateState } = useRoundState(selectedRoundId);
	const { address } = useAccount();
	const { connectWallet } = usePrivy();

	const updateTicket = (index: number, newTicket: ITicket) => {
		const updatedTickets = [...draftTickets];
		updatedTickets[index] = newTicket;
		setTickets(updatedTickets);
	};

	const deleteTicket = (index: number) => {
		if (draftTickets.length === 1) {
			setTickets([EMPTY_TICKET]);
			return;
		}
		const updatedTickets = draftTickets.filter((_: ITicket, i: number) => i !== index);
		setTickets(updatedTickets);
	};

	const handleAddTicket = () => {
		if (draftTickets.length >= 9) return toast.error('Maximum is 9 tickets per bet');
		setTickets([...draftTickets, { numbers: [0, 0, 0, 0, 0], symbol: 0 }]);
	};

	const handleProceed = () => {
		if (!address) {
			connectWallet();
			return;
		}
		if (duplicates) {
			return toast.error('You can not proceed with duplicate tickets');
		}
		if (filledTickets.length === 0) {
			return toast.error('You must fill at least one ticket');
		}
		if (filledTickets.length !== draftTickets.length) {
			return toast.error('You must fill all tickets');
		}
		updateState(RoundState.PLACING);
	};
	const handleEdit = () => {
		updateState(RoundState.FILLING);
	};

	const filledTickets = draftTickets.filter((ticket: ITicket) => ticket.numbers.every((number) => number !== 0));
	// Check that there are no same tickets with same numbers(sort by numbers) and symbol
	const duplicates = isDuplicate(filledTickets);

	const handleDeleteAll = () => {
		setTickets([EMPTY_TICKET]);
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
									isValid={filledTickets.length > 1}
								>
									<div className="flex flex-col">
										<div className="text-lg font-semibold">{t('doYouReallyWantToDeleteAllDraftedTickets')}</div>
										<div className="text-sm text-muted-foreground">{t('thisActionCannotBeUndone')}</div>
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
									isValid={filledTickets.length > 0}
								>
									<div className="flex flex-col">
										<div className="text-lg font-semibold">{t('doYouWantToRandomizeAllLines')}</div>
										<div className="text-sm text-muted-foreground">{t('thisWillReplaceAllYourCurrentNumbers')}</div>
									</div>
								</Alert>
							</div>
						)
					}
					className={'grow flex flex-col justify-between'}
					renderItem={(ticket: ITicket, index: number) => (
						<Line
							key={index}
							line={ticket}
							order={index + 1}
							onEdit={(newTicket) => updateTicket(index, newTicket)}
							onDelete={() => deleteTicket(index)}
							isDisabled={isDisabled}
							symbolUnlocked={true}
							showDelete={draftTickets.length > 1}
						/>
					)}
				/>

				<footer className={cn('grid grid-cols-2 gap-4')}>
					{isDisabled ? (
						<Button className={'col-span-2 gap-2  border-primary text-secondary-foreground'} variant={'outline'} onClick={handleEdit}>
							<PencilIcon className={'w-3.5 h-3.5'} />
							{t('edit')}
						</Button>
					) : (
						<Button
							variant={'outline'}
							className={cn('border-primary text-secondary-foreground gap-1 hover:scale-105 transition-all', {
								'col-span-2': state !== RoundState.FILLING,
							})}
							onClick={handleAddTicket}
						>
							<PlusCircleIcon className={'w-4 h-4'} />
							{t('addTicket')}
						</Button>
					)}

					{state === RoundState.FILLING && (
						<Alert
							onSuccess={handleProceed}
							trigger={
								<Button
									className="gap-1 hover:scale-105 transition-all"
									disabled={filledTickets.length !== draftTickets.length}
									variant={!address ? 'default' : 'success'}
								>
									{address ? (
										<>
											{t('proceed')} ({filledTickets.length} {t('create.tickets', { count: filledTickets.length })})
											<ArrowRightIcon className={'w-4 h-4'} />
										</>
									) : (
										t('connectWallet')
									)}
								</Button>
							}
							storageKey="lottery-unlockSymbol"
							isValid={filledTickets.length < 3}
						>
							<div className="flex flex-col">
								<div className="text-base font-semibold whitespace-nowrap">Do you really want to continue without symbol?</div>

								<AddMoreLinesText />
							</div>
						</Alert>
					)}
				</footer>
			</div>
		</AnimatePresence>
	);
};

const MoreLinesTooltip = () => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<CircleHelp className={'w-4 h-4 fill-foreground text-background'} />
				</TooltipTrigger>
				<TooltipContent>
					<div className="max-w-[300px]">
						<AddMoreLinesText />
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

export default CreateTicket;
