import { ZeroAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Button, Calendar, Checkbox, Popover, PopoverContent, PopoverTrigger, ScrollArea, Separator, toast } from '@betfinio/components/ui';
import { useIsMember } from 'betfinio_context/lib/query';
import { ArrowLeftIcon, CalendarIcon, LoaderIcon, PlusCircleIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { motion } from 'motion/react';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { getRoundTimes, useAvailableRounds, useDraftTickets, useInterval, useRoundOffset, useSelectedRound, useTicketPrice } from '@/src/lib/query';
import { type IRound, RoundState } from '@/src/lib/types.ts';
import { useRoundState } from '../lib/query/state';
import BuySteps from './shared/BuySteps';

const PlaceBet = () => {
	const { t } = useTranslation('lottery');

	// Queries
	const allRounds = useAvailableRounds();
	const { data: draftTickets = [] } = useDraftTickets();
	const { data: selectedRoundId } = useSelectedRound();
	const { data: ticketPrice = 0n } = useTicketPrice();
	const { data: interval = 0n } = useInterval();
	const { data: offset = 0n } = useRoundOffset();
	const { address = ZeroAddress } = useAccount();
	const { data: isMember = false } = useIsMember(address);

	// Filter to only current and future rounds (past rounds can't be bet on)
	const rounds = useMemo(() => {
		if (interval === 0n) return allRounds;
		const currentTime = Math.floor(Date.now() / 1000);
		return allRounds.filter((round) => {
			const { end } = getRoundTimes(round.roundId, interval, offset);
			return end > currentTime;
		});
	}, [allRounds, interval, offset]);

	// Helper to compute round end timestamp
	const getRoundEnd = (round: IRound) => {
		if (interval === 0n) return 0;
		const { end } = getRoundTimes(round.roundId, interval, offset);
		return end;
	};

	// State
	const [selectedRounds, setSelectedRounds] = useState<IRound[]>([]);
	const [visibleRounds, setVisibleRounds] = useState<IRound[]>([]);
	const { state, updateState } = useRoundState(selectedRoundId);
	const [isOpen, setIsOpen] = useState(false);
	const toastShown = useRef(false);

	// Effects
	const roundsKey = useMemo(() => rounds.map((r) => r.roundId.toString()).join(','), [rounds]);
	useEffect(() => {
		setSelectedRounds(rounds.slice(0, 1));
		setVisibleRounds(rounds.slice(0, 6));
	}, [roundsKey]);

	// Computed values
	const totalAmount = BigInt(draftTickets.length * selectedRounds.length) * ticketPrice;
	const roundsAsDates = rounds.map((e: IRound) => new Date(getRoundEnd(e) * 1000));
	const selectedDates = selectedRounds.map((e) => new Date(getRoundEnd(e) * 1000));

	// Handlers
	const handleToggle = (value: bigint[]) => {
		const toggleRoundId = value[0];
		const toggleRound = rounds.find((e) => e.roundId === toggleRoundId);
		if (!toggleRound) return;
		if (selectedRounds.find((e) => e.roundId === toggleRoundId)) {
			if (toastShown.current) return;
			if (selectedRounds.length === 1) {
				toast.error('At least one draw must be selected');
				toastShown.current = true;
				return;
			}
			setSelectedRounds((prev) => prev.filter((e) => e.roundId !== toggleRoundId));
		} else {
			setSelectedRounds((prev) => {
				if (prev.find((r) => r.roundId === toggleRound.roundId)) return prev;
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
					const date = new Date(getRoundEnd(e) * 1000);
					return date.getDate() === calendarDate.getDate() && date.getMonth() === calendarDate.getMonth() && date.getFullYear() === calendarDate.getFullYear();
				});
				if (!round) return undefined;
				return round;
			})
			.filter((e): e is IRound => !!e);

		setSelectedRounds(selected);
		// append selected rounds to visible rounds, only unique
		setVisibleRounds((prev) => [...prev, ...selected].filter((e, index, self) => index === self.findIndex((t) => t.roundId === e.roundId)));
	};

	const compare = (roundDates: Date[]) => (specific: Date) =>
		!roundDates.find(
			(date: Date) => specific.getFullYear() === date.getFullYear() && specific.getMonth() === date.getMonth() && specific.getDate() === date.getDate(),
		);

	const handleBackToTickets = () => {
		updateState(RoundState.FILLING);
	};

	const handleOpen = async () => {
		if (!isMember) {
			toast.error(t('connectedWalletIsNotMember'));
			return;
		}

		setIsOpen(true);
	};

	// Early returns
	if (rounds.length < 1) {
		return <div className={'w-full h-full bg-background-light border border-border rounded-xl col-span-3 md:col-span-1 flex flex-col'} />;
	}

	const realRecipient = address;

	// Main render
	return (
		<motion.div
			className={cn('w-full h-full bg-background-light border border-border rounded-xl col-span-3 md:col-span-1 flex flex-col', {
				'border-2 border-primary': state === RoundState.PLACING,
			})}
		>
			<div className={'p-3 flex flex-col items-center gap-1'}>
				<h2 className={'text-lg uppercase text-secondary-foreground'}>{t('placeBet.title')}</h2>
				<div className={'text-foreground flex flex-row gap-1 items-center'}>
					<BetValue value={BigInt(draftTickets.length) * ticketPrice} withIcon /> {t('placeBet.ticketPrice')}
				</div>
			</div>
			<Separator />
			<div className={'p-3 flex flex-col items-start gap-2'}>
				<div className="flex flex-row justify-end w-full px-2">
					<div>
						{selectedRounds.length} {t('create.selected', { count: selectedRounds.length })}
					</div>
				</div>
				<ScrollArea className={cn('w-full', 'h-[300px]')} type="auto">
					<div className={'flex flex-col gap-2'}>
						{visibleRounds.map((round: IRound) => (
							<RoundInfo
								key={round.roundId.toString()}
								round={round}
								isSelected={selectedRounds.find((e) => e.roundId === round.roundId) !== undefined}
								toggleSelect={handleToggle}
								getRoundEnd={getRoundEnd}
								ticketPrice={ticketPrice}
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
			<div className={'p-3 flex flex-col items-start gap-2 justify-end grow'}>
				<div className="w-full grid grid-cols-3 gap-2">
					<Button
						variant={'outline'}
						className={cn('gap-1 px-4 w-auto xl:hidden', state === RoundState.FILLING && 'hidden')}
						onClick={handleBackToTickets}
						size={'icon'}
					>
						<ArrowLeftIcon className={'w-4 h-4'} />
						{t('back')}
					</Button>
					<Button variant={'success'} className={'w-full gap-1 xl:col-span-3 col-span-2'} onClick={handleOpen} disabled={totalAmount === 0n}>
						<motion.div initial={{ scale: 0 }} animate={{ scale: isOpen ? 1 : 0 }} exit={{ scale: 0 }}>
							<LoaderIcon className={'w-4 h-4 animate-spin'} />
						</motion.div>
						{t('placeBet.proceedFor')}
						{totalAmount > 0n && <BetValue value={totalAmount} withIcon iconClassName={'border border-[0.1px] rounded-full border-primary-foreground'} />}
					</Button>
					<BuySteps
						buy={{ tickets: draftTickets, recipient: realRecipient, roundIds: selectedRounds.map((e) => e.roundId) }}
						isOpen={isOpen}
						setIsOpen={setIsOpen}
					/>
				</div>
			</div>
		</motion.div>
	);
};

export const RoundInfo: FC<{
	round: IRound;
	isSelected: boolean;
	toggleSelect: (roundIds: bigint[]) => void;
	getRoundEnd: (round: IRound) => number;
	ticketPrice: bigint;
}> = ({ round, isSelected, toggleSelect, getRoundEnd, ticketPrice }) => {
	const { t } = useTranslation('lottery');
	const ref = useRef<HTMLDivElement>(null);
	const finish = getRoundEnd(round);
	const totalTickets = ticketPrice > 0n ? Number(round.betsAmount / ticketPrice) : 0;
	useEffect(() => {
		if (ref.current) {
			ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
		}
	}, []);

	return (
		<div
			ref={ref}
			className={'flex flex-row justify-between cursor-pointer items-center h-14 w-full p-4 bg-secondary text-foreground rounded-lg'}
			onClick={() => toggleSelect([round.roundId])}
		>
			<div className={'flex flex-col'}>
				<div className={'text-sm'}>{finish > 0 ? DateTime.fromSeconds(finish).toFormat('DD, T') : '...'}</div>
				<div className={'text-xs text-muted-foreground'}>
					{totalTickets} {t('create.tickets', { count: totalTickets })}
				</div>
			</div>
			<div className={'flex flex-row gap-4 items-center'}>
				<Checkbox
					checked={isSelected}
					onCheckedChange={() => toggleSelect([round.roundId])}
					className={'data-[state=checked]:bg-success w-4 h-4 data-[state=checked]:text-success-foreground data-[state=checked]:border-success'}
				/>
			</div>
		</div>
	);
};

export default PlaceBet;
