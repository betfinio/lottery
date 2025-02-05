import CurrentRound from '@/src/components/tabs/CurrentRound.tsx';
import MyTickets from '@/src/components/tabs/MyTickets.tsx';
import { useSelectedRound } from '@/src/lib/query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';

const DrawInfo = () => {
	const { data: round } = useSelectedRound();
	return (
		<div className={'w-full rounded-lg col-span-3 md:col-span-1 flex  flex-col relative h-[593px]'}>
			<Tabs defaultValue={'draw'} className={'w-full flex-grow flex flex-col h-full'}>
				<TabsList className={'w-full grid grid-cols-2'}>
					<TabsTrigger value={'draw'}>Current Draw</TabsTrigger>
					<TabsTrigger value={'tickets'}>My tickets</TabsTrigger>
				</TabsList>
				<TabsContent value={'draw'} className={'w-full flex-grow border border-border bg-background-light rounded-xl  overflow-hidden'}>
					{round && <CurrentRound round={round} />}
				</TabsContent>
				<TabsContent value={'tickets'} className={'w-full flex-grow border border-border bg-background-light rounded-xl  overflow-hidden'}>
					<MyTickets />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default DrawInfo;
