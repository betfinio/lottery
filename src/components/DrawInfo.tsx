import CurrentRound from '@/src/components/tabs/CurrentRound.tsx';
import { useFreeLinesCount, useSelectedRound } from '@/src/lib/query';
import { ZeroAddress } from '@betfinio/abi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@betfinio/components/ui';
import { SearchIcon, StarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useDrawInfoTab } from '../lib/query/state';
import type { DrawTab } from '../lib/types';
import ActiveTicketsList from './tabs/ActiveTicketsList';
import BonusTab, { BonusTabIcon } from './tabs/BonusTab';
import OldTicketsList from './tabs/OldTicketsList';

const DrawInfo = () => {
	const { address = ZeroAddress } = useAccount();

	const { t } = useTranslation('lottery');
	const { data: round } = useSelectedRound();
	const { tab, setTab } = useDrawInfoTab();

	return (
		<div className={'w-full rounded-lg col-span-3 md:col-span-1 flex  flex-col relative h-[593px]'}>
			<Tabs value={tab} onValueChange={(value) => setTab(value as DrawTab)} className={'w-full grow flex flex-col h-full'}>
				<TabsList className={'w-full flex flex-row items-center justify-between'}>
					<div className={'grid grid-cols-3 gap-2 w-full'}>
						<TabsTrigger value={'draw'}>{t('currentDraw')}</TabsTrigger>
						<TabsTrigger value={'active'}>{t('activeTickets')}</TabsTrigger>
						<TabsTrigger value={'old'}>{t('oldTickets')}</TabsTrigger>
					</div>
					<TabsTrigger value={'bonus'} className={'p-0 size-[34px] aspect-square'}>
						<BonusTabIcon />
					</TabsTrigger>
				</TabsList>
				<TabsContent value={'draw'} className={'w-full grow border border-border bg-background-light rounded-xl  overflow-hidden'}>
					{round && <CurrentRound round={round} />}
				</TabsContent>
				<TabsContent value={'active'} className={'w-full grow border border-border bg-background-light rounded-xl  overflow-hidden p-2 pb-0'}>
					<ActiveTicketsList />
				</TabsContent>
				<TabsContent value={'old'} className={'w-full grow border border-border bg-background-light rounded-xl  overflow-hidden p-2 pb-0'}>
					<OldTicketsList />
				</TabsContent>
				<TabsContent value={'bonus'} className={'w-full grow border border-border bg-background-light rounded-xl  overflow-hidden p-2 pb-0'}>
					<BonusTab />
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default DrawInfo;
