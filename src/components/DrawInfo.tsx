import CurrentRound from '@/src/components/tabs/CurrentRound.tsx';
import { useSelectedRound } from '@/src/lib/query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';
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
				<TabsList className={'w-full grid grid-cols-3'}>
					<TabsTrigger value={'draw'}>Current Draw</TabsTrigger>
					<TabsTrigger value={'active'}>Active tickets</TabsTrigger>
					<TabsTrigger value={'old'}>Old tickets</TabsTrigger>
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
			</Tabs>
		</div>
	);
};

export default DrawInfo;
