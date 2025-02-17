import { useGetRoundFromParams, useRoundStatus } from '@/src/lib/query';
import { RoundStatus } from '@/src/lib/types';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import TicketsList from '../../tabs/TicketsList';
import { PlayerDidNotWin } from './PlayerDidNotWin';
import PlayerTickets from './PlayerTickets';
import { PlayerWon, itemsList } from './PlayerWon';
import { RoundNotCalculated } from './RoundNotCalculated';

export const PlayerStatusForRound: FC = () => {
	const round = useGetRoundFromParams();
	const { data: roundStatus, isLoading } = useRoundStatus(round);

	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const roundIsNotCalculated = false;

	const playerHasBets = true;
	const playerDidNotWin = false;
	const playerWon = true;

	const showCalculating = roundStatus === RoundStatus.WAITING_FOR_REQUEST;
	const showPlayerDidNotWin = playerHasBets && playerDidNotWin;
	const showPlayerWon = playerHasBets && playerWon;
	if (showCalculating) {
		return (
			<div className="pb-8 h-full flex flex-col items-center justify-center">
				<RoundNotCalculated />
			</div>
		);
	}

	if (showPlayerDidNotWin) {
		return (
			<div className="flex flex-col items-center">
				<div className="text-lg mb-4 font-semibold">{t('yourTicketsInDraw')}</div>
				<div className="flex gap-5 flex-wrap justify-end ">
					<div className="mt-auto">
						<PlayerDidNotWin />
					</div>
					<div>
						<PlayerTickets />
					</div>
					{/* <PlayerDidNotWin /> */}
					{/* <PlayerWon /> */}
				</div>
			</div>
		);
	}

	if (showPlayerWon) {
		return (
			<div className="flex flex-col items-center justify-center">
				<div className=" text-lg font-semibold">{t('yourTicketsInDraw')}</div>
				<div className="flex gap-5 flex-wrap justify-center">
					<PlayerWon />
					<PlayerTickets />
				</div>
			</div>
		);
	}
	return null;
};
