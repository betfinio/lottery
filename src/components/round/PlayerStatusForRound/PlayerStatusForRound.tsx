import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import TicketsList from '../../tabs/TicketsList';
import { PlayerDidNotWin } from './PlayerDidNotWin';
import PlayerTickets from './PlayerTickets';
import { PlayerWon, itemsList } from './PlayerWon';
import { RoundNotCalculated } from './RoundNotCalculated';

export const PlayerStatusForRound: FC = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const roundIsNotCalculated = false;

	const playerHasBets = true;
	const playerDidNotWin = true;
	const playerWon = true;

	if (roundIsNotCalculated) {
		return (
			<div className="pb-8 h-full flex flex-col items-center justify-center">
				<RoundNotCalculated />
			</div>
		);
	}

	if (playerHasBets && playerDidNotWin) {
		return (
			<div className="flex flex-col items-center">
				<div className="text-lg mb-4 font-semibold">{t('yourTicketsInDraw')}</div>
				<div className="flex gap-5 flex-wrap justify-end ">
					<div className="mt-auto">
						<PlayerDidNotWin />
					</div>
					<div>
						<TicketsList tickets={itemsList} />
					</div>
					{/* <PlayerDidNotWin /> */}
					{/* <PlayerWon /> */}
				</div>
			</div>
		);
	}

	if (playerHasBets && playerWon) {
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
