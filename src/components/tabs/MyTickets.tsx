import ActiveTicketsList from '@/src/components/tabs/ActiveTicketsList.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';
import { useState } from 'react';
import OldTicketsList from './OldTicketsList';

function MyTickets() {
	const [selectedTab, setSelectedTab] = useState<'active' | 'old'>('active');
	return (
		<div className={'p-2 flex flex-col gap-4 justify-between relative h-full'}>
			<Tabs value={selectedTab}>
				<TabsList className={'bg-transparent w-full grid grid-cols-2'}>
					<TabsTrigger variant={'contained'} value="active" className={''} onClick={() => setSelectedTab('active')}>
						Active tickets
					</TabsTrigger>
					<TabsTrigger variant={'contained'} value="old" className={''} onClick={() => setSelectedTab('old')}>
						Old tickets
					</TabsTrigger>
				</TabsList>
				<TabsContent value="active">
					<ActiveTicketsList />
				</TabsContent>
				<TabsContent value="old">
					<OldTicketsList />
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default MyTickets;
