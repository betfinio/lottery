import CurrentRound from '@/src/components/tabs/CurrentRound.tsx';
import MyTickets from '@/src/components/tabs/MyTickets.tsx';
import { useSelectedRound } from '@/src/lib/query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';

const DrawInfo = () => {
	const { data: round } = useSelectedRound();
	if (!round) return null;
	return (
		<div className={'w-full h-full rounded-lg col-span-3 md:col-span-1 flex  flex-col relative'}>
			<Tabs defaultValue={'draw'} className={'w-full flex-grow flex flex-col h-full'}>
				<TabsList className={'w-full grid grid-cols-3'}>
					<TabsTrigger value={'draw'}>Current Draw</TabsTrigger>
					<TabsTrigger value={'tickets'}>My tickets</TabsTrigger>
					<TabsTrigger value={'history'}>History</TabsTrigger>
				</TabsList>
				<TabsContent value={'draw'} className={'w-full flex-grow border border-border bg-background-light rounded-xl  overflow-hidden'}>
					<CurrentRound round={round.address} />
				</TabsContent>
				<TabsContent value={'tickets'} className={'w-full flex-grow border border-border bg-background-light rounded-xl  overflow-hidden'}>
					<MyTickets />
				</TabsContent>
				<TabsContent value={'history'}>
					<div>history</div>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default DrawInfo;
