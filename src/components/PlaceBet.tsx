import { linesAvailabilityQuery, useActiveRounds, useDraftLines, useLinesAvailability, useSelectedRound, useTicketPrice } from '@/src/lib/query';
import { useBuyTicket } from '@/src/lib/query/mutations.ts';
import { type IRound, RoundState } from '@/src/lib/types.ts';
import { ZeroAddress, truncateEthAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { toast } from '@betfinio/components/hooks';
import { BetValue } from '@betfinio/components/shared';
import {
	Button,
	Calendar,
	Checkbox,
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
	ScrollArea,
	Separator,
	SwitchComponent,
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@betfinio/components/ui';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertTriangleIcon, ArrowLeftIcon, CalendarIcon, LoaderIcon, PlusCircleIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { type FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Address, isAddress } from 'viem';
import { useAccount, useConfig } from 'wagmi';
import { ETHSCAN } from '../globals';
import { useRoundState } from '../lib/query/state';
import BuySteps from './shared/BuySteps';

const EMPTY_ARRAY: IRound[] = [];
const PlaceBet = () => {
	const { t } = useTranslation('lottery');

	const queryClient = useQueryClient();
	const config = useConfig();
	// Queries
	const { data: rounds = EMPTY_ARRAY } = useActiveRounds();
	const { data: lines = [] } = useDraftLines();
	const { data: round } = useSelectedRound();
	const { data: ticketPrice = 0n } = useTicketPrice(round?.address);
	const { address = ZeroAddress } = useAccount();
	const { data: draftLines = [] } = useDraftLines();

	// State
	const [recipient, setRecipient] = useState<Address | undefined>(ZeroAddress);
	const [selectedRounds, setSelectedRounds] = useState<IRound[]>([]);
	const [visibleRounds, setVisibleRounds] = useState<IRound[]>([]);
	const { state, updateState } = useRoundState(round?.address);
	const [newRecipientDialogOpen, setNewRecipientDialogOpen] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const toastShown = useRef(false);

	// Effects
	useEffect(() => {
		setSelectedRounds(rounds.slice(0, 1));
		setVisibleRounds(rounds.slice(0, 3));
	}, [rounds]);

	// Computed values
	const totalAmount = BigInt(lines.length * selectedRounds.length) * ticketPrice;
	const isValidRecipient = recipient && isAddress(recipient as string, { strict: false });
	const roundsAsDates = rounds.map((e: IRound) => new Date(e.finish * 1000));
	const selectedDates = selectedRounds.map((e) => new Date(e.finish * 1000));

	const getHasCollisions = async () => {
		const queries = selectedRounds.map((round) => {
			const query = queryClient.ensureQueryData(linesAvailabilityQuery(round.address, draftLines, config));
			return query;
		});
		const queriesResult = await Promise.all(queries);
		return queriesResult.some((e) => e?.some((e) => e === false));
	};

	// Handlers
	const handleToggle = (value: Address[]) => {
		const toggleRoundAddress: Address = value[0];
		const toggleRound = rounds.find((e) => e.address === toggleRoundAddress);
		if (!toggleRound) return;
		if (selectedRounds.find((e) => e.address === toggleRoundAddress)) {
			if (toastShown.current) return;
			if (selectedRounds.length === 1) {
				toast({
					title: 'At least one draw must be selected',
					variant: 'destructive',
				});
				toastShown.current = true;
				return;
			}
			setSelectedRounds((prev) => prev.filter((e) => e.address !== toggleRoundAddress));
		} else {
			setSelectedRounds((prev) => {
				if (prev.find((r) => r.address === toggleRound.address)) return prev;
				return [...prev, toggleRound];
			});
			toastShown.current = false;
		}
	};

	const addMoreRound = () => {
		// ignore if there are no more rounds to add
		if (visibleRounds.length >= rounds.length) return;
		setVisibleRounds((prev) => [...prev, ...rounds.slice(visibleRounds.length, visibleRounds.length + 1)]);
	};

	const handleCalendarChange = (days?: Date[]) => {
		if (!days) return;
		const selected = days
			.map((calendarDate) => {
				const round = rounds.find((e) => {
					const date = new Date(e.finish * 1000);
					return date.getDate() === calendarDate.getDate() && date.getMonth() === calendarDate.getMonth() && date.getFullYear() === calendarDate.getFullYear();
				});
				if (!round) return;
				return {
					address: round.address,
					finish: round.finish,
				} as IRound;
			})
			.filter((e) => e) as IRound[];

		setSelectedRounds(selected);
		// append selected rounds to visible rounds, only unique
		setVisibleRounds((prev) => [...prev, ...selected].filter((e, index, self) => index === self.findIndex((t) => t.address === e.address)));
	};

	const compare = (roundDates: Date[]) => (specific: Date) =>
		!roundDates.find(
			(date: Date) => specific.getFullYear() === date.getFullYear() && specific.getMonth() === date.getMonth() && specific.getDate() === date.getDate(),
		);

	const handleSaveRecipient = (newRecipient: Address) => {
		setRecipient(newRecipient);
		setNewRecipientDialogOpen(false);
	};
	const handleNewRecipientDialogOpenChange = (open: boolean) => {
		if (open && recipient?.toLowerCase() !== address?.toLowerCase() && recipient !== ZeroAddress) {
			setRecipient(address);
			return;
		}
		setNewRecipientDialogOpen(open);
	};

	const handleBackToLines = () => {
		updateState(RoundState.FILLING);
	};

	const handleOpen = async () => {
		if (await getHasCollisions()) {
			toast({
				title: 'Lines are already taken',
				variant: 'destructive',
			});
			return;
		}
		setIsOpen(true);
	};

	// Early returns
	if (rounds.length < 1) {
		return <div className={'w-full h-full bg-background-light border border-border rounded-xl col-span-3 md:col-span-1 flex flex-col'} />;
	}

	const realRecipient = recipient === ZeroAddress ? address : recipient ? recipient : address;

	// Main render
	return (
		<motion.div
			className={cn('w-full h-full bg-background-light border border-border rounded-xl col-span-3 md:col-span-1 flex flex-col', {
				'border-2 border-primary/70': state === RoundState.PLACING,
			})}
		>
			<div className={'p-3 flex flex-col items-center gap-1'}>
				<h2 className={'text-lg uppercase text-secondary-foreground'}>{t('placeBet.title')}</h2>
				<div className={'text-foreground flex flex-row gap-1 items-center'}>
					<BetValue value={BigInt(lines.length) * ticketPrice} withIcon /> {t('placeBet.ticketPrice')}
				</div>
			</div>
			<Separator />
			<div className={'p-3 flex flex-col items-start gap-2'}>
				<div className="flex flex-row justify-end w-full px-2">
					<div>
						{selectedRounds.length} {t('selected')}
					</div>
				</div>
				<ScrollArea className={cn('w-full', 'h-[300px]')} type="auto">
					<div className={'flex flex-col gap-2'}>
						{visibleRounds.map((date: IRound) => (
							<RoundInfo
								key={date.address}
								round={date}
								isSelected={selectedRounds.find((e) => e.address === date.address) !== undefined}
								toggleSelect={handleToggle}
							/>
						))}
					</div>
				</ScrollArea>
				<div className={'grid grid-cols-2 gap-2 justify-center w-full'}>
					<Popover>
						<PopoverTrigger className={' flex gap-1 items-center text-sm w-full justify-center'}>
							<CalendarIcon className={'w-4 h-4 '} />
							{t('placeBet.openCalendar')}
						</PopoverTrigger>
						<PopoverContent className={'border border-border'}>
							<Calendar mode={'multiple'} disabled={compare(roundsAsDates)} selected={selectedDates} onSelect={handleCalendarChange} />
						</PopoverContent>
					</Popover>
					<Button
						variant={'outline'}
						className={'gap-1 border-primary text-secondary-foreground'}
						onClick={() => addMoreRound()}
						disabled={visibleRounds.length >= rounds.length}
					>
						<PlusCircleIcon className={'w-4 h-4'} />
						{t('addMoreDraws')}
					</Button>
				</div>
			</div>
			<Separator />
			<div className={'p-3 flex flex-col items-start gap-2 justify-end flex-grow'}>
				<Dialog open={newRecipientDialogOpen} onOpenChange={handleNewRecipientDialogOpenChange}>
					<DialogTrigger asChild>
						<div className={'flex items-center justify-between w-full gap-2 text-sm '}>
							<div className={'flex flex-row gap-2 items-center'}>
								<SwitchComponent
									onCheckedChange={handleNewRecipientDialogOpenChange}
									checked={recipient?.toLowerCase() !== address?.toLowerCase() && recipient !== ZeroAddress}
								/>
								{t('placeBet.buyForSomeone')}
							</div>
							{recipient && recipient.toLowerCase() !== address?.toLowerCase() && recipient !== ZeroAddress && (
								<a
									href={`${ETHSCAN}/address/${recipient}`}
									onClick={(e) => e.stopPropagation()}
									target="_blank"
									rel="noreferrer"
									className={'text-sm text-secondary-foreground'}
								>
									{truncateEthAddress(recipient)}
								</a>
							)}
						</div>
					</DialogTrigger>
					<DialogContent className={'lottery'}>
						<NewRecipientDialog onSave={handleSaveRecipient} onCancel={() => setNewRecipientDialogOpen(false)} />
					</DialogContent>
				</Dialog>
				<div className="w-full grid grid-cols-3 gap-2">
					<Button
						variant={'outline'}
						className={cn('gap-1 px-4 w-auto xl:hidden', state === RoundState.FILLING && 'hidden')}
						onClick={handleBackToLines}
						size={'icon'}
					>
						<ArrowLeftIcon className={'w-4 h-4'} />
						{t('back')}
					</Button>
					<Button
						variant={'success'}
						className={'w-full gap-1 xl:col-span-3 col-span-2'}
						onClick={handleOpen}
						disabled={totalAmount === 0n || !isValidRecipient}
					>
						<motion.div initial={{ scale: 0 }} animate={{ scale: isOpen ? 1 : 0 }} exit={{ scale: 0 }}>
							<LoaderIcon className={'w-4 h-4 animate-spin'} />
						</motion.div>
						{t('placeBet.proceedFor')} <BetValue value={totalAmount} withIcon iconClassName={'border border-[0.1px] rounded-full border-primary-foreground'} />
					</Button>
					<BuySteps buy={{ lines, recipient: realRecipient, rounds: selectedRounds.map((e) => e.address) }} isOpen={isOpen} setIsOpen={setIsOpen} />
				</div>
			</div>
		</motion.div>
	);
};

export const RoundInfo: FC<{
	round: IRound;
	isSelected: boolean;
	toggleSelect: (address: Address[]) => void;
}> = ({ round, isSelected, toggleSelect }) => {
	const { data: draftLines = [] } = useDraftLines();
	const { data: linesAvailability = [], isLoading } = useLinesAvailability(round.address, draftLines, isSelected);
	const collisions = linesAvailability.map((e, index) => ({ index: index + 1, isCollision: e })).filter((e) => e.isCollision === false);
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (ref.current) {
			ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
		}
	}, []);

	return (
		<div
			ref={ref}
			className={'flex flex-row justify-between cursor-pointer items-center h-14 w-full p-4 bg-secondary text-foreground rounded-lg'}
			onClick={() => toggleSelect([round.address])}
		>
			<div className={'text-sm'}>{DateTime.fromSeconds(round.finish).toFormat('DD, T')}</div>
			<div className={'flex flex-row gap-4 items-center'}>
				{isLoading ? <LoaderIcon className={'w-4 h-4 animate-spin'} /> : collisions.length > 0 && <CollisionIndicator index={collisions.map((e) => e.index)} />}
				<Checkbox
					checked={isSelected}
					onCheckedChange={() => toggleSelect([round.address])}
					className={'data-[state=checked]:bg-success w-4 h-4 data-[state=checked]:text-success-foreground data-[state=checked]:border-success'}
				/>
			</div>
		</div>
	);
};

const NewRecipientDialog = ({ onSave, onCancel }: { onSave: (address: Address) => void; onCancel: () => void }) => {
	const [recipient, setRecipient] = useState<Address>('' as Address);
	const [changed, setChanged] = useState(false);
	const { address = ZeroAddress } = useAccount();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setRecipient(e.target.value as Address);
		setChanged(true);
	};
	const validAddress = isAddress(recipient, { strict: false });
	const isMe = recipient.toLowerCase() === address.toLowerCase();
	return (
		<div className="flex flex-col gap-2 bg-background-light p-4 rounded-lg md:w-[450px] w-[98vw]">
			<DialogTitle className={'font-normal'}>Enter recipient address</DialogTitle>
			<Input autoComplete="off" placeholder={'0x1234567890abcdefabcd1234567890abcdefabcd'} value={recipient} onChange={handleChange} />
			{!validAddress && changed && <div className="text-destructive text-sm">Invalid address</div>}
			{isMe && <div className="text-destructive text-sm">Enter another address</div>}
			<div className="grid grid-cols-3">
				<Button variant="outline" size="sm" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					className={'gap-1 col-start-3'}
					size={'sm'}
					disabled={!recipient || !validAddress || !changed}
					onClick={() => recipient && validAddress && onSave(recipient)}
				>
					Save
				</Button>
			</div>
		</div>
	);
};

const CollisionIndicator = ({ index }: { index: number[] }) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<AlertTriangleIcon className={'w-4 h-4 text-destructive'} />
				</TooltipTrigger>
				<TooltipContent>
					<div>Lines {index.join(', ')} are already taken</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
export default PlaceBet;
