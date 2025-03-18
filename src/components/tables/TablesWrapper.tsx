import MyDraws from '@/src/components/tables/MyDraws.tsx';
import { SwitchComponent, Tabs, TabsContent, TabsList, TabsTrigger, Toggle } from '@betfinio/components/ui';
import { useState } from 'react';
import AllDraws from './AllDraws';

function TablesWrapper() {
	const [includeFutureDraws, setIncludeFutureDraws] = useState(false);
	return (
		<Tabs className={'w-full'} defaultValue={'all'}>
			<div className="flex justify-between items-center">
				<TabsList>
					<TabsTrigger value="all">All draws</TabsTrigger>
					<TabsTrigger value="my">My draws</TabsTrigger>
				</TabsList>
				<div className="flex items-center gap-2 text-sm flex-row">
					<SwitchComponent className="scale-90" checked={includeFutureDraws} onCheckedChange={setIncludeFutureDraws} />
					<div className="whitespace-nowrap">Include future draws</div>
				</div>
			</div>
			<TabsContent value="all">
				<AllDraws includeFutureDraws={includeFutureDraws} />
			</TabsContent>
			<TabsContent value="my">
				<MyDraws includeFutureDraws={includeFutureDraws} />
			</TabsContent>
		</Tabs>
	);
}

export default TablesWrapper;
