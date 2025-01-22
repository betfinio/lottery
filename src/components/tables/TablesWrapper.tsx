import MyDraws from '@/src/components/tables/MyDraws.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';
import AllDraws from './AllDraws';

function TablesWrapper() {
	return (
		<Tabs className={'w-full'} defaultValue={'all'}>
			<TabsList>
				<TabsTrigger value="all">All draws</TabsTrigger>
				<TabsTrigger value="my">My draws</TabsTrigger>
			</TabsList>
			<TabsContent value="all">
				<AllDraws />
			</TabsContent>
			<TabsContent value="my">
				<MyDraws />
			</TabsContent>
		</Tabs>
	);
}

export default TablesWrapper;
