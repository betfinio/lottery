import { useActiveRounds, useDraftLines, useMultiAllowance, useRoundStatus, useSelectedRound, useTicketPrice } from '@/src/lib/query';
import { useBuyTicket, useUnlockMultibet } from '@/src/lib/query/mutations.ts';
import type { IRound } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Button, Calendar, Checkbox, Input, Popover, PopoverContent, PopoverTrigger, ScrollArea, Separator, SwitchComponent } from '@betfinio/components/ui';
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
	const { address } = useAccount();
	const { data: multiAllowance = 0n } = useMultiAllowance(address);

	// Mutations
	const { mutate: buyTicket, isPending } = useBuyTicket();
	const { mutate: unlock, isPending: isPendingUnlock } = useUnlockMultibet();

	// State
	const [recipient, setRecipient] = useState<Address | undefined>(address);
	const [selectedRounds, setSelectedRounds] = useState<IRound[]>([]);
	const [buyAnother, setBuyAnother] = useState(false);

	useEffect(() => {
		if (!buyAnother) {
			setRecipient(address);
		}
	}, [buyAnother, address]);

	useEffect(() => {
		if (rounds.length > 0) {
			setSelectedRounds(rounds.slice(0, 1));
		}
	}, [rounds]);

	// Computed values
	const totalAmount = BigInt(lines.length * selectedRounds.length) * ticketPrice;
	const isValidRecipient = recipient && isAddress(recipient as string, { strict: false });
	const roundsAsDates = rounds.map((e) => new Date(e.finish * 1000));
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

	const handleBuyAnother = (checked: boolean) => {
		setBuyAnother(checked);
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
		console.log(selected);

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

	// Main render
	return (
		<div className={'w-full h-full bg-background-light border border-border rounded-xl col-span-3 md:col-span-1 flex flex-col lottery'}>
			<div className={'p-3 flex flex-col items-center gap-2'}>
				<h2 className={'text-lg'}>{t('title')}</h2>
				<div className={'text-secondary-foreground flex flex-row gap-1 items-center'}>
					<BetValue value={1500} withIcon /> {t('ticketPrice')}
				</div>
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
					<Button size={'sm'} variant={'ghost'} className="p-0" onClick={() => setSelectedRounds(rounds)}>
						Select all
					</Button>
				</div>
				<ScrollArea className={cn('w-full', buyAnother ? 'h-72' : 'h-[340px]')}>
					<div className={'flex flex-col gap-1'}>
						{rounds.map((date) => (
							<div
								key={date.address}
								className={'flex flex-row justify-between cursor-pointer items-center h-10 w-full p-1 px-2 bg-secondary text-secondary-foreground rounded-lg'}
								onClick={() => handleToggle([date.address])}
							>
								<div className={'text-sm'}>{DateTime.fromSeconds(date.finish).toFormat('cccc, DD')}</div>
								<Checkbox
									checked={selectedRounds.find((e) => e.address === date.address) !== undefined}
									onCheckedChange={() => handleToggle([date.address])}
									className={'data-[state=checked]:bg-success data-[state=checked]:text-success-foreground data-[state=checked]:border-success'}
								/>
							</div>
						))}
						{/* {selectedRounds.length === 0 && <div className={'text-muted-foreground text-sm text-center'}>{t('noDraws')}</div>} */}
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
