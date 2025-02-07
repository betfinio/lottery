import { AccordionContent, AccordionItem, AccordionTrigger } from '@betfinio/components/ui';
import type { FC } from 'react';
import { JackpotRowTable } from './JackpotRowTable';
import type { JACKPOTS, JackpotRowItem } from './constants';
interface RoundJackpotRowProps {
	jackpot: JackpotRowItem;
}
export const RoundJackpotRow: FC<RoundJackpotRowProps> = ({ jackpot }) => {
	const Icon = jackpot.icon;
	return (
		<AccordionItem className={'p-0 w-full '} value={jackpot.id.toString()}>
			<AccordionTrigger className=" bg-secondary rounded-md   flex  py-3 px-6 h-16 gap-4">
				<div className="grid grid-cols-4 w-full">
					<div className="flex gap-2 items-center">
						{Icon ? <Icon className="w-6 h-6" /> : <div className="w-6 h-6 " />}
						<div className="flex gap-4 items-center font-semibold whitespace-nowrap">{jackpot.name}</div>
					</div>
					<div className="flex gap-4 items-center justify-center whitespace-nowrap">{jackpot.combination}</div>
					<div className="flex gap-4 items-center justify-center  whitespace-nowrap">Payout</div>{' '}
					<div className="flex gap-4 items-center justify-center whitespace-nowrap">Winners</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="flex p-0 w-full">
				<div className="w-14  justify-center after:border-l  after:border-l-gray-800 after:h-full after:block  py-2 hidden md:flex" />
				<div className="mt-2 w-full">
					<JackpotRowTable />
				</div>
			</AccordionContent>
		</AccordionItem>
	);
};
