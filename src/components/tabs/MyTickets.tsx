import { Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';
import ActiveTicketsList from '@/src/components/tabs/ActiveTicketsList.tsx';
import { useTicketsTab } from '@/src/lib/query/state';
import OldTicketsList from './OldTicketsList';

function MyTickets() {
	const { tab, setTab } = useTicketsTab();
	return (
		<div className={'p-2 flex flex-col gap-4 justify-between relative h-full'}>
			<Tabs value={tab} className="h-full">
				<TabsList className={'bg-transparent w-full grid grid-cols-2'}>
					<TabsTrigger variant={'contained'} value="active" className={''} onClick={() => setTab('active')}>
						Active tickets
					</TabsTrigger>
					<TabsTrigger variant={'contained'} value="old" className={''} onClick={() => setTab('old')}>
						Old tickets
					</TabsTrigger>
				</TabsList>
				<TabsContent value="active" className={'h-[calc(100%-40px)]'}>
					<ActiveTicketsList />
				</TabsContent>
				<TabsContent value="old" className={'h-[calc(100%-40px)]'}>
					<OldTicketsList />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default MyTickets;
