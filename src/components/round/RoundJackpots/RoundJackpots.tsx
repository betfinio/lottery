import { Accordion } from '@betfinio/components/ui';
import { RoundJackpotRow } from './RoundJackpotRow';
import { JACKPOTS } from './constants';
export const RoundJackpots = () => {
	return (
		<div>
			<div className="flex gap-4 items-center px-6 py-2 text-sm">
				<div className="grid grid-cols-4 w-full text-tertiary-foreground  font-semibold  ">
					<div className="flex gap-4 items-center  whitespace-nowrap">Jackpot</div>
					<div className="flex gap-4 items-center justify-center whitespace-nowrap">Combination</div>
					<div className="flex gap-4 items-center justify-center   whitespace-nowrap">Payout</div>{' '}
					<div className="flex gap-4 items-center justify-center   whitespace-nowrap">Winners</div>
				</div>
				<div className="w-6 h-1 " />
			</div>

			<Accordion type="single" collapsible className="w-full gap-3 flex flex-col ">
				{JACKPOTS.map((jackpot) => (
					<RoundJackpotRow key={jackpot.id} jackpot={jackpot} />
				))}
			</Accordion>
		</div>
	);
};
