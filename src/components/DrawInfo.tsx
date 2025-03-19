import CurrentRound from '@/src/components/tabs/CurrentRound.tsx';
import { useSelectedRound } from '@/src/lib/query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';
import { SearchIcon, StarIcon } from 'lucide-react';
import { useDrawInfoTab } from '../lib/query/state';
import type { DrawTab } from '../lib/types';
import ActiveTicketsList from './tabs/ActiveTicketsList';
import OldTicketsList from './tabs/OldTicketsList';

const DrawInfo = () => {
	const { data: round } = useSelectedRound();
	const { tab, setTab } = useDrawInfoTab();
	return (
		<div className={'w-full rounded-lg col-span-3 md:col-span-1 flex  flex-col relative h-[593px]'}>
			<Tabs value={tab} onValueChange={(value) => setTab(value as DrawTab)} className={'w-full flex-grow flex flex-col h-full'}>
				<TabsList className={'w-full flex flex-row items-center justify-between'}>
					<div className={'grid grid-cols-3 gap-2'}>
						<TabsTrigger value={'draw'}>Current draw</TabsTrigger>
						<TabsTrigger value={'active'}>My tickets</TabsTrigger>
						<TabsTrigger value={'old'}>My winnings</TabsTrigger>
					</div>
					<TabsTrigger value={'bonus'} className={'p-0 w-[34px] aspect-square hidden'}>
						<StarIcon className={'w-4 h-4'} />
					</TabsTrigger>
				</TabsList>
				<TabsContent value={'draw'} className={'w-full flex-grow border border-border bg-background-light rounded-xl  overflow-hidden'}>
					{round && <CurrentRound round={round} />}
				</TabsContent>
				<TabsContent value={'active'} className={'w-full flex-grow border border-border bg-background-light rounded-xl  overflow-hidden p-2 pb-0'}>
					<ActiveTicketsList />
				</TabsContent>
				<TabsContent value={'old'} className={'w-full flex-grow border border-border bg-background-light rounded-xl  overflow-hidden p-2 pb-0'}>
					<OldTicketsList />
				</TabsContent>
				<TabsContent value={'bonus'} className={'w-full flex-grow border border-border bg-background-light rounded-xl  overflow-hidden p-2 pb-0'}>
					bonus
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default DrawInfo;
