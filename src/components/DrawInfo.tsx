import CurrentRound from '@/src/components/tabs/CurrentRound.tsx';
import { Route } from '@/src/routes/lottery/lotto/$round.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';

const DrawInfo = () => {
	const { round } = Route.useParams();
	return (
		<div className={'w-full h-full rounded-lg col-span-3 md:col-span-1 flex bg-background-light flex-col relative'}>
			<Tabs defaultValue={'draw'} className={'w-full flex-grow flex flex-col h-full'}>
				<TabsList className={'w-full grid grid-cols-3'}>
					<TabsTrigger value={'draw'}>Current Draw</TabsTrigger>
					<TabsTrigger value={'tickets'}>My tickets</TabsTrigger>
					<TabsTrigger value={'history'}>History</TabsTrigger>
				</TabsList>
				<TabsContent value={'draw'} className={'w-full flex-grow border border-border rounded-xl'}>
					<CurrentRound round={round} />
				</TabsContent>
				<TabsContent value={'tickets'}>
					<div>tickets</div>
				</TabsContent>
				<TabsContent value={'history'}>
					<div>history</div>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default DrawInfo;
