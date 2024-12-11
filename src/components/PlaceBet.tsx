import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Button, Input, ScrollArea, Separator, SwitchComponent, ToggleGroup, ToggleGroupItem } from '@betfinio/components/ui';
import { CalendarIcon } from 'lucide-react';
import { DateTime } from 'luxon';
import { useState } from 'react';

const PlaceBet = () => {
	const amount = 50000;
	const dates = [1733875200, 1734393600];
	const [selectedDates, setSelectedDates] = useState<number[]>(dates);
	const [buyAnother, setBuyAnother] = useState(false);

	const handleChange = (value: string[]) => {
		setSelectedDates([...new Set([...selectedDates.filter((e) => !dates.includes(e)), ...value.map(Number)])].sort());
	};
	const handleCalendar = () => {
		setSelectedDates([...selectedDates, Math.floor(Date.now()) / 1000].sort());
	};
	const handleBuyAnother = (checked: boolean) => {
		setBuyAnother(checked);
	};
	return (
		<div className={'w-full h-full bg-background-light rounded-xl col-span-3 md:col-span-1 flex flex-col'}>
			<div className={'p-3 flex flex-col items-center gap-2'}>
				<h2 className={'text-lg'}>When would you like to participate?</h2>
				<div className={'text-secondary-foreground flex flex-row gap-1 items-center'}>
					<BetValue value={amount} withIcon /> / ticket / draw
				</div>
				<ToggleGroup type={'multiple'} defaultValue={dates.map((e) => e.toString())} className={'w-2/3'} variant={'outline'} onValueChange={handleChange}>
					<ToggleGroupItem value={dates[0].toString()} className={'w-1/2 text-xs'}>
						{DateTime.fromSeconds(dates[0]).toFormat('cccc, DD')}
					</ToggleGroupItem>
					<ToggleGroupItem value={dates[1].toString()} className={'w-1/2 text-xs'}>
						{DateTime.fromSeconds(dates[1]).toFormat('cccc, DD')}
					</ToggleGroupItem>
				</ToggleGroup>
			</div>
			<Separator />
			<div className={'p-3 flex flex-col items-start gap-2'}>
				<div className={'flex justify-between w-full items-center'}>
					<div className={'text-sm'}>Selected draws</div>
					<Button variant={'ghost'} className={'gap-1 text-foreground'} onClick={handleCalendar}>
						<CalendarIcon className={'w-4 h-4 '} />
						Open calendar
					</Button>
				</div>
				<ScrollArea className={cn('w-full', buyAnother ? 'h-60' : 'h-72')}>
					<div className={'flex flex-col gap-1'}>
						{selectedDates.map((date) => (
							<div key={date} className={'flex flex-row justify-between items-center w-full p-1 px-2 bg-secondary text-secondary-foreground rounded-lg'}>
								<div className={'text-sm'}>{DateTime.fromSeconds(date).toFormat('cccc, DD')}</div>
								<Button variant={'ghost'} size={'sm'} className={'text-error text-destructive'}>
									Remove
								</Button>
							</div>
						))}
						{selectedDates.length === 0 && <div className={'text-muted-foreground text-sm text-center'}>No draws selected</div>}
					</div>
				</ScrollArea>
			</div>
			<Separator />
			<div className={'p-3 flex flex-col items-start gap-2 justify-end flex-grow'}>
				<div className={'flex items-center gap-2 text-sm '}>
					<SwitchComponent checked={buyAnother} onCheckedChange={handleBuyAnother} />
					Buy for someone else
				</div>
				<div className={cn(!buyAnother && 'hidden', 'w-full')}>
					<Input className={'w-full'} placeholder={'Recipient address'} />
				</div>
				<Button variant={'default'} className={'w-full gap-1'}>
					Proceed for <BetValue value={amount} withIcon iconClassName={'border rounded-full border-primary-foreground'} />
				</Button>
			</div>
		</div>
	);
};

export default PlaceBet;
