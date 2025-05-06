import MyDraws from '@/src/components/tables/MyDraws.tsx';
import { SwitchComponent, Tabs, TabsContent, TabsList, TabsTrigger, Toggle } from '@betfinio/components/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AllDraws from './AllDraws';

function TablesWrapper() {
	const { t } = useTranslation('lottery');
	const [includeFutureDraws, setIncludeFutureDraws] = useState(true);
	return (
		<Tabs className={'w-full'} defaultValue={'all'}>
			<div className="flex justify-between items-center">
				<TabsList>
					<TabsTrigger value="all">{t('allDraws')}</TabsTrigger>
					<TabsTrigger value="my">{t('myDraws')}</TabsTrigger>
				</TabsList>
				<div className="flex items-center gap-2 text-sm flex-row">
					<SwitchComponent className="scale-90" checked={includeFutureDraws} onCheckedChange={setIncludeFutureDraws} />
					<div className="whitespace-nowrap">{t('includeFutureDraws')}</div>
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
