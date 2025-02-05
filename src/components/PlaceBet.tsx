import { useActiveRounds, useDraftLines, useLinesAvailability, useMultiAllowance, useSelectedRound, useTicketPrice } from '@/src/lib/query';
import { useBuyTicket, useUnlockMultibet } from '@/src/lib/query/mutations.ts';
import { type IRound, RoundState } from '@/src/lib/types.ts';
import { ZeroAddress, truncateEthAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
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
import { motion } from 'framer-motion';
import { AlertTriangleIcon, CalendarIcon, LoaderIcon, LockIcon, PlusCircleIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { type FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Address, isAddress } from 'viem';
import { useAccount } from 'wagmi';
import { ETHSCAN } from '../globals';
import { useRoundState } from '../lib/gql/state';

const PlaceBet = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'placeBet' });

	// Queries
	const { data: rounds = [] } = useActiveRounds();
	const { data: lines = [] } = useDraftLines();
	const { data: round } = useSelectedRound();
	const { data: ticketPrice = 0n } = useTicketPrice(round?.address);
	const { address } = useAccount();
	const { data: multiAllowance = 0n } = useMultiAllowance(address);

	// Mutations
	const { mutate: buyTicket, isPending } = useBuyTicket();
	const { mutate: unlock, isPending: isPendingUnlock } = useUnlockMultibet();

	// State
	const [recipient, setRecipient] = useState<Address | undefined>(address);
	const [selectedRounds, setSelectedRounds] = useState<IRound[]>([]);
	const [visibleRounds, setVisibleRounds] = useState<IRound[]>([]);
	const { state } = useRoundState(round?.address);
	const [newRecipientDialogOpen, setNewRecipientDialogOpen] = useState(false);

	// Effects
	useEffect(() => {
		setVisibleRounds(rounds.slice(0, 3));
	}, [rounds]);

	useEffect(() => {
		if (rounds.length > 0) {
			setSelectedRounds(rounds.slice(0, 1));
		}
	}, [rounds]);

	// Computed values
	const totalAmount = BigInt(lines.length * selectedRounds.length) * ticketPrice;
	const isValidRecipient = recipient && isAddress(recipient as string, { strict: false });
	const roundsAsDates = rounds.map((e: IRound) => new Date(e.finish * 1000));
	const selectedDates = selectedRounds.map((e) => new Date(e.finish * 1000));

	// Handlers
	const handleToggle = (value: Address[]) => {
		const toggleRoundAddress: Address = value[0];
		const toggleRound = rounds.find((e) => e.address === toggleRoundAddress);
		if (!toggleRound) return;
		if (selectedRounds.find((e) => e.address === toggleRoundAddress)) {
			setSelectedRounds((prev) => prev.filter((e) => e.address !== toggleRoundAddress));
		} else {
			setSelectedRounds((prev) => [...prev, toggleRound]);
		}
	};

	const handleUnlock = () => {
		unlock();
	};

	const addMoreRound = () => {
		setVisibleRounds((prev) => [...prev, ...rounds.slice(visibleRounds.length, visibleRounds.length + 1)]);
	};

	const handleBuyTicket = () => {
		if (!recipient) return;
		buyTicket({
			lines,
			recipient,
			rounds: selectedRounds.map((e) => e.address),
		});
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
		if (open && recipient?.toLowerCase() !== address?.toLowerCase()) {
			setRecipient(address);
			return;
		}
		setNewRecipientDialogOpen(open);
	};

	// Early returns
	if (rounds.length < 2) {
		return <div className={'w-full h-full bg-background-light border border-border rounded-xl col-span-3 md:col-span-1 flex flex-col'} />;
	}

	// Main render
	return (
		<motion.div
			className={cn('w-full h-full bg-background-light border border-border rounded-xl col-span-3 md:col-span-1 flex flex-col', {
				'border-2 border-primary/70 create-shadow': state === RoundState.PLACING,
			})}
		>
			<div className={'p-3 flex flex-col items-center gap-1'}>
				<h2 className={'text-lg uppercase text-secondary-foreground'}>{t('title')}</h2>
				<div className={'text-foreground flex flex-row gap-1 items-center'}>
					<BetValue value={BigInt(lines.length) * ticketPrice} withIcon /> {t('ticketPrice')}
				</div>
			</div>
			<Separator />
			<div className={'p-3 flex flex-col items-start gap-2'}>
				<div className="flex flex-row justify-end w-full px-2">
					<div>{selectedRounds.length} selected</div>
				</div>
				<ScrollArea className={cn('w-full', 'h-[300px]')}>
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
							{t('openCalendar')}
						</PopoverTrigger>
						<PopoverContent className={'border border-border'}>
							<Calendar mode={'multiple'} disabled={compare(roundsAsDates)} selected={selectedDates} onSelect={handleCalendarChange} />
						</PopoverContent>
					</Popover>
					<Button variant={'outline'} className={'gap-1 border-primary text-secondary-foreground'} onClick={() => addMoreRound()}>
						<PlusCircleIcon className={'w-4 h-4'} />
						Add more
					</Button>
				</div>
			</div>
			<Separator />
			<div className={'p-3 flex flex-col items-start gap-2 justify-end flex-grow'}>
				<Dialog open={newRecipientDialogOpen} onOpenChange={handleNewRecipientDialogOpenChange}>
					<DialogTrigger asChild>
						<div className={'flex items-center justify-between w-full gap-2 text-sm '}>
							<div className={'flex flex-row gap-2 items-center'}>
								<SwitchComponent checked={recipient !== address} />
								{t('buyForSomeone')}
							</div>
							{recipient && recipient.toLowerCase() !== address?.toLowerCase() && (
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
				{multiAllowance > totalAmount ? (
					<Button variant={'default'} className={'w-full gap-1'} onClick={handleBuyTicket} disabled={isPending || totalAmount === 0n || !isValidRecipient}>
						<motion.div initial={{ scale: 0 }} animate={{ scale: isPending ? 1 : 0 }} exit={{ scale: 0 }}>
							<LoaderIcon className={'w-4 h-4 animate-spin'} />
						</motion.div>
						{t('proceedFor')} <BetValue value={totalAmount} withIcon iconClassName={'border rounded-full border-primary-foreground'} />
					</Button>
				) : (
					<Button variant={'default'} className={'w-full gap-1'} onClick={handleUnlock} disabled={isPendingUnlock}>
						<motion.div initial={{ scale: 0 }} animate={{ scale: isPendingUnlock ? 1 : 0 }} exit={{ scale: 0 }}>
							<LoaderIcon className={'w-4 h-4 animate-spin'} />
						</motion.div>
						<LockIcon className={'w-4 h-4'} />
						{t('unlockMultiBet')}
					</Button>
				)}
			</div>
		</motion.div>
	);
};

export const RoundInfo: FC<{ round: IRound; isSelected: boolean; toggleSelect: (address: Address[]) => void }> = ({ round, isSelected, toggleSelect }) => {
	const { data: draftLines = [] } = useDraftLines();
	const { data: linesAvailability = [], isLoading } = useLinesAvailability(round.address, draftLines, isSelected);
	const collisions = linesAvailability.map((e, index) => ({ index: index + 1, isCollision: e })).filter((e) => e.isCollision === false);
	return (
		<div
			key={round.address}
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
	const [recipient, setRecipient] = useState<Address>('0x');
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
			<Input autoComplete="off" placeholder={'Enter address'} value={recipient} onChange={handleChange} />
			{!validAddress && changed && <div className="text-destructive text-sm">Invalid address</div>}
			{isMe && <div className="text-destructive text-sm">Enter another address</div>}
			<div className="grid grid-cols-3">
				<Button variant={'outline'} size={'sm'} className={'gap-1 border-primary text-secondary-foreground'} onClick={() => onCancel()}>
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
