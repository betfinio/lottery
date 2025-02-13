import type { FC } from 'react';
import { JackpotStar } from './JackpotStar';

export const JackpotStarsSpread: FC = () => {
	const stars = [
		{ x: 160, y: 48, scale: 1 }, // Center star
		{ x: 203.5, y: 52.8, scale: 0.7 }, // Right stars
		{ x: 237.5, y: 62.3, scale: 0.6 },
		{ x: 265, y: 68.6, scale: 0.5 },
		{ x: 287, y: 75.8, scale: 0.4 },
		{ x: 33, y: 75.8, scale: 0.4 }, // Left stars
		{ x: 55, y: 68.6, scale: 0.5 },
		{ x: 82.5, y: 62.3, scale: 0.6 },
		{ x: 116.5, y: 52.8, scale: 0.7 },
	];

	return (
		<>
			{stars.map((star, index) => (
				<JackpotStar key={index} x={star.x} y={star.y} scale={star.scale} index={index} />
			))}
		</>
	);
};
