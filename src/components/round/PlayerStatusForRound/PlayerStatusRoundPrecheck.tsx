import { useGetRoundFromParams, useRoundStatus, useRoundTicketsByPlayer } from '@/src/lib/query';
import { RoundStatus } from '@/src/lib/types';
import { ZeroAddress } from '@betfinio/abi';
import type { FC } from 'react';
import { useAccount } from 'wagmi';
import { PlayerStatusForRound } from './PlayerStatusForRound';

export const PlayerStatusRoundPrecheck: FC = () => {
	return (
		<div className="mt-4 md:min-h-[541px] flex justify-center items-center">
			<PlayerStatusForRound />
		</div>
	);
};
