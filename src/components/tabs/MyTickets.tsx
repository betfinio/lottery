import ActiveTicketsList from '@/src/components/tabs/ActiveTicketsList.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';
import OldTicketsList from './OldTicketsList';

function MyTickets() {
	return (
		<div className={'p-2 flex flex-col gap-4 justify-between relative h-full'}>
			<Tabs defaultValue={'active'}>
				<TabsList className={'bg-transparent w-full'}>
					<TabsTrigger variant={'contained'} value="active" className={'w-1/3'}>
						Active tickets
					</TabsTrigger>
					<TabsTrigger variant={'contained'} value="giveaway" className={'w-1/3'}>
						Giveaways
					</TabsTrigger>
					<TabsTrigger variant={'contained'} value="old" className={'w-1/3'}>
						Old tickets
					</TabsTrigger>
				</TabsList>
				<TabsContent value="active" className={'h-full'}>
					<ActiveTicketsList />
				</TabsContent>
				<TabsContent value="giveaway">
					<div className={'border border-purple-box p-4 rounded-lg text-center'}>This feature is coming soon</div>
				</TabsContent>
				<TabsContent value="old" className={'h-full'}>
					<OldTicketsList />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default MyTickets;
