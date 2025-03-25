import { useGetRoundFromParams, useRoundJackpots } from '@/src/lib/query';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@betfinio/components/ui';
import type { FC } from 'react';
import Ticket from '../../icons/Ticket';
import { JackpotRowTable } from './JackpotRowTable';
import type { JACKPOTS, JackpotRowItem } from './constants';
interface RoundJackpotRowProps {
	jackpot: JackpotRowItem;
}
export const RoundJackpotRow: FC<RoundJackpotRowProps> = ({ jackpot }) => {
	const round = useGetRoundFromParams();
	const { data: jackpotData, isLoading } = useRoundJackpots(round);

	const currentJackpot = jackpotData?.[jackpot.id][0];
	const hasNoTickets = !currentJackpot?.tickets || currentJackpot?.tickets.length === 0;
	return (
		<AccordionItem className={'p-0 w-full '} value={jackpot.id.toString()}>
			<AccordionTrigger
				className={cn(' bg-secondary rounded-md flex p-3 h-[72px] ', {
					'[&>svg]:opacity-0': hasNoTickets,
				})}
				disabled={hasNoTickets}
			>
				<div className="grid grid-cols-4 w-full">
					<div className="flex gap-2 items-center">
						<div className="w-24 relative">
							{jackpot.icon}
							<div className="absolute inset-0 flex flex-col items-center justify-center">
								<div className="mt-1.5 text-xs font-semibold">{jackpot.name}</div>
							</div>
						</div>
					</div>
					<div className="flex gap-4 items-center justify-center whitespace-nowrap">{jackpot.combination}</div>
					<div className="flex gap-4 items-center justify-center  whitespace-nowrap">
						<BetValue
							withIcon
							className={cn({
								'animate-pulse blur': isLoading,
							})}
							value={BigInt(currentJackpot?.claimed ?? 0)}
						/>
					</div>
					<div className="flex gap-1 items-center justify-center whitespace-nowrap">
						{currentJackpot?.tickets.length}
						<Ticket className={'w-4 h-4 text-primary'} />
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="flex p-0 w-full">
				<div className="w-14  justify-center after:border-l  after:border-l-gray-800 after:h-full after:block  py-2 hidden md:flex" />
				<div className="mt-2 w-full">
					<JackpotRowTable id={jackpot.id} />
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};
