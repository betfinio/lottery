import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { PlayerDidNotWin } from './PlayerDidNotWin';
import { PlayerWon } from './PlayerWon';
import { RoundNotCalculated } from './RoundNotCalculated';

export const PlayerStatusForRound: FC = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const roundIsNotCalculated = false;

	const playerHasBets = true;
	const playerDidNotWin = false;
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
				<div className="mb-6 text-lg font-semibold">{t('yourTicketsInDraw')}</div>
				<PlayerDidNotWin />
			</div>
		);
	}

	if (playerHasBets && playerWon) {
		return (
			<div className="flex flex-col items-center">
				<div className="mb-6 text-lg font-semibold">{t('yourTicketsInDraw')}</div>
				<PlayerWon />
			</div>
		);
	}
	return null;
};
