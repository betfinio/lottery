import type { ReactElement } from 'react';
import type { GetRoundJackpotsQuery } from '@/.graphclient';
import { COMBINATIONS_MAP } from '@/src/lib/utils';
import { JackpotFrame } from '../../shared/JackpotTiara/JackpotFrame';

export interface JackpotRowItem {
	id: keyof GetRoundJackpotsQuery;
	name: string;
	icon?: ReactElement;
	combination: string;
}
export const JACKPOTS: JackpotRowItem[] = [
	{
		id: 'jackpot1',
		name: 'Jackpot 1',
		icon: <JackpotFrame animateStars className={'w-full h-full text-[var(--gold)]'} />,
		combination: COMBINATIONS_MAP['5+1'].combination,
	},
	{
		id: 'jackpot2',
		name: 'Jackpot 2',
		icon: <JackpotFrame animateStars className={'w-full h-full text-[var(--gold)]'} />,
		combination: COMBINATIONS_MAP['5'].combination,
	},
	{
		id: 'jackpot3',
		name: 'Jackpot 3',
		icon: <JackpotFrame animateStars className={'w-full h-full text-[var(--silver)]'} />,
		combination: COMBINATIONS_MAP['4+1'].combination,
	},
	{
		id: 'jackpot4',
		name: 'Jackpot 4',
		icon: <JackpotFrame animateStars className={'w-full h-full text-[var(--silver)]'} />,

		combination: COMBINATIONS_MAP['4'].combination,
	},
	{
		id: 'jackpot5',
		name: 'Jackpot 5',
		icon: <JackpotFrame animateStars className={'w-full h-full text-[var(--silver)]'} />,
		combination: COMBINATIONS_MAP['3+1'].combination,
	},
	{
		id: 'jackpot6',
		name: 'Jackpot 6',
		icon: <JackpotFrame animateStars className={'w-full h-full text-[var(--bronze)]'} />,

		combination: COMBINATIONS_MAP['3'].combination,
	},
	{
		id: 'jackpot7',
		name: 'Jackpot 7',
		icon: <JackpotFrame animateStars className={'w-full h-full text-[var(--bronze)]'} />,
		combination: COMBINATIONS_MAP['2+1'].combination,
	},
];
