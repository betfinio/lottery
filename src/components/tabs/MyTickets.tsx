import ActiveTicketsList from '@/src/components/tabs/ActiveTicketsList.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';

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
				<TabsContent value="giveaway">giveaway tickets</TabsContent>
				<TabsContent value="old">old tickets</TabsContent>
			</Tabs>
		</div>
	);
}

export default MyTickets;
