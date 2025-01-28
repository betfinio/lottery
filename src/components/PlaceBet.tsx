import { useActiveRounds, useDraftLines, useMultiAllowance, useRoundStatus, useSelectedRound, useTicketPrice } from '@/src/lib/query';
import { useBuyTicket, useManualRequest, useUnlockMultibet } from '@/src/lib/query/mutations.ts';
import type { IRound } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import {
	Button,
	Calendar,
	Input,
	Popover,
	PopoverContent,
	PopoverTrigger,
	ScrollArea,
	Separator,
	SwitchComponent,
	ToggleGroup,
	ToggleGroupItem,
} from '@betfinio/components/ui';
import { motion } from 'framer-motion';
import { CalendarIcon, LoaderIcon, LockIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Address, isAddress } from 'viem';
import { useAccount } from 'wagmi';

const PlaceBet = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'placeBet' });

	// Queries
	const { data: rounds = [] } = useActiveRounds();
	const { data: lines = [] } = useDraftLines();
	const { data: round } = useSelectedRound();
	const { data: ticketPrice = 0n } = useTicketPrice(round?.address);
	const { data: status = 0 } = useRoundStatus(round?.address);
	const { address } = useAccount();
	const { data: multiAllowance = 0n } = useMultiAllowance(address);

	// Mutations
	const { mutate: buyTicket, isPending } = useBuyTicket();
	const { mutate: manualRequest } = useManualRequest();
	const { mutate: unlock, isPending: isPendingUnlock } = useUnlockMultibet();

	// State
	const [recipient, setRecipient] = useState<Address | undefined>(address);
	const [selectedRounds, setSelectedRounds] = useState<IRound[]>(rounds.slice(0, 2));
	const [buyAnother, setBuyAnother] = useState(false);

	// Effects
	useEffect(() => {
		setRecipient(address);
	}, [address]);

	useEffect(() => {
		if (!buyAnother) {
			setRecipient(address);
		}
	}, [buyAnother]);

	// Computed values
	const totalAmount = BigInt(lines.length * selectedRounds.length) * ticketPrice;
	const isValidRecipient = recipient && isAddress(recipient as string, { strict: false });
	const roundsAsDates = rounds.map((e) => new Date(e.finish * 1000));
	const selectedDates = selectedRounds.map((e) => new Date(e.finish * 1000));

	// Handlers
	const handleChange = (value: string[]) => {
		setSelectedRounds(rounds.filter((e) => value.includes(e.address)));
	};

	const handleBuyAnother = (checked: boolean) => {
		setBuyAnother(checked);
	};

	const removeRound = (round: Address) => {
		setSelectedRounds((prev) => prev.filter((e) => e.address !== round));
	};

	const handleManualRequest = () => {
		manualRequest({ round: round?.address });
	};

	const handleUnlock = () => {
		unlock();
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
	};

	const compare = (roundDates: Date[]) => (specific: Date) =>
		!roundDates.find(
			(date: Date) => specific.getFullYear() === date.getFullYear() && specific.getMonth() === date.getMonth() && specific.getDate() === date.getDate(),
		);

	// Early returns
	if (rounds.length < 2) {
		return <div className={'w-full h-full bg-background-light border border-border rounded-xl col-span-3 md:col-span-1 flex flex-col'} />;
	}

	if (status === 5 || status === 0) {
		return (
			<div className={'w-full h-full bg-background-light border border-border rounded-xl col-span-3 md:col-span-1 flex flex-col'}>
				<div className={'p-3 flex flex-col items-center h-full gap-2 justify-center'}>
					<LoaderIcon className={'w-10 h-10 animate-spin'} />
					{status === 5 && (
						<div className={'flex flex-col items-center gap-2'}>
							<span className={'text-sm'}>{t('waitingForResult')}</span>
							<Button onClick={handleManualRequest}>{t('manualRequest')}</Button>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Main render
	return (
		<div className={'w-full h-full bg-background-light border border-border rounded-xl col-span-3 md:col-span-1 flex flex-col'}>
			<div className={'p-3 flex flex-col items-center gap-2'}>
				<h2 className={'text-lg'}>{t('title')}</h2>
				<div className={'text-secondary-foreground flex flex-row gap-1 items-center'}>
					<BetValue value={1500} withIcon /> {t('ticketPrice')}
				</div>
				<ToggleGroup type={'multiple'} defaultValue={[]} value={selectedRounds.map((e) => e.address)} className={'w-full gap-2'} onValueChange={handleChange}>
					<ToggleGroupItem variant={'outline'} value={rounds[0].address} className={'w-1/2 text-xs flex flex-col'}>
						<span>{DateTime.fromSeconds(rounds[0].finish).toFormat('cccc')}</span>
						<span>{DateTime.fromSeconds(rounds[0].finish).toFormat('DD')}</span>
					</ToggleGroupItem>
					<ToggleGroupItem variant={'outline'} value={rounds[1].address} className={'w-1/2 text-xs flex flex-col'}>
						<span>{DateTime.fromSeconds(rounds[1].finish).toFormat('cccc')}</span>
						<span>{DateTime.fromSeconds(rounds[1].finish).toFormat('DD')}</span>
					</ToggleGroupItem>
				</ToggleGroup>
			</div>
			<Separator />
			<div className={'p-3 flex flex-col items-start gap-2'}>
				<div className={'flex justify-between w-full items-center'}>
					<div className={'text-sm text'}>{t('selectedDraws')}</div>
					<Popover>
						<PopoverTrigger className={' flex gap-1 items-center text-sm'}>
							<CalendarIcon className={'w-4 h-4 '} />
							{t('openCalendar')}
						</PopoverTrigger>
						<PopoverContent className={'border border-border'}>
							<Calendar mode={'multiple'} disabled={compare(roundsAsDates)} selected={selectedDates} onSelect={handleCalendarChange} />
						</PopoverContent>
					</Popover>
				</div>
				<ScrollArea className={cn('w-full', buyAnother ? 'h-60' : 'h-72')}>
					<div className={'flex flex-col gap-1'}>
						{selectedRounds.map((date) => (
							<div
								key={date.address}
								className={'flex flex-row justify-between items-center w-full p-1 px-2 bg-secondary text-secondary-foreground rounded-lg'}
							>
								<div className={'text-sm'}>{DateTime.fromSeconds(date.finish).toFormat('cccc, DD')}</div>
								<Button variant={'ghost'} size={'sm'} className={'text-error text-destructive'} onClick={() => removeRound(date.address)}>
									{t('remove')}
								</Button>
							</div>
						))}
						{selectedRounds.length === 0 && <div className={'text-muted-foreground text-sm text-center'}>{t('noDraws')}</div>}
					</div>
				</ScrollArea>
			</div>
			<Separator />
			<div className={'p-3 flex flex-col items-start gap-2 justify-end flex-grow'}>
				<div className={cn(!buyAnother && 'hidden', 'w-full')}>
					<Input className={'w-full'} placeholder={t('recipientPlaceholder')} value={recipient} onChange={(e) => setRecipient(e.target.value as Address)} />
				</div>
				<div className={'flex items-center gap-2 text-sm '}>
					<SwitchComponent checked={buyAnother} onCheckedChange={handleBuyAnother} />
					{t('buyForSomeone')}
				</div>
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
		</div>
	);
};

export default PlaceBet;
