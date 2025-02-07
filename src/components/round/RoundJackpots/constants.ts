import { COMBINATIONS_MAP } from '@/src/lib/utils';
import { BronzeStar, type CustomIconProps, GoldStar, SilverStar } from '../../icons';

export interface JackpotRowItem {
	id: number;
	name: string;
	icon?: CustomIconProps;
	combination: string;
}
export const JACKPOTS: JackpotRowItem[] = [
	{
		id: 1,
		name: 'Jackpot 1',
		icon: GoldStar,
		combination: COMBINATIONS_MAP['5+1'].combination,
	},
	{
		id: 2,
		name: 'Jackpot 2',
		icon: SilverStar,
		combination: COMBINATIONS_MAP['5'].combination,
	},
	{
		id: 3,
		name: 'Jackpot 3',
		icon: BronzeStar,
		combination: COMBINATIONS_MAP['4+1'].combination,
	},
	{
		id: 4,
		name: 'Jackpot 4',

		combination: COMBINATIONS_MAP['4'].combination,
	},
	{
		id: 5,
		name: 'Jackpot 5',

		combination: COMBINATIONS_MAP['3+1'].combination,
	},
	{
		id: 6,
		name: 'Jackpot 6',

		combination: COMBINATIONS_MAP['3'].combination,
	},
	{
		id: 7,
		name: 'Jackpot 7',

		combination: COMBINATIONS_MAP['2+1'].combination,
	},
];
