import type { FC } from 'react';
import { PlayerStatusForRound } from './PlayerStatusForRound';

export const PlayerStatusRoundPrecheck: FC = () => {
	return (
		<div className="mt-4 md:min-h-[541px] flex justify-center items-center">
			<PlayerStatusForRound />
		</div>
	);
};
