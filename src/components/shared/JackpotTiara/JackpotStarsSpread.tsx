import { AnimatePresence, motion } from 'framer-motion';
import type { FC } from 'react';
import { JackpotStar } from './JackpotStar';

interface Props {
	animate?: boolean;
}

export const JackpotStarsSpread: FC<Props> = ({ animate = true }) => {
	const stars = [
		{ x: 287, y: 75.8, scale: 0.4 },
		{ x: 33, y: 75.8, scale: 0.4 },
		{ x: 265, y: 68.6, scale: 0.5 },
		{ x: 55, y: 68.6, scale: 0.5 },
		{ x: 237.5, y: 62.3, scale: 0.6 },
		{ x: 82.5, y: 62.3, scale: 0.6 },
		{ x: 203.5, y: 52.8, scale: 0.7 },
		{ x: 116.5, y: 52.8, scale: 0.7 },
		{ x: 160, y: 48, scale: 1 },
	];

	if (!animate) {
		return (
			<>
				{stars.map((star, index) => (
					<JackpotStar key={index} x={star.x} y={star.y} scale={star.scale} index={index} />
				))}
			</>
		);
	}

	return (
		<AnimatePresence>
			{stars.map((star, index) => (
				<motion.g
					key={index}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{
						delay: index * 0.1,
						duration: 0.5,
						ease: 'easeIn',
					}}
					transform={`translate(${star.x}, ${star.y})`}
				>
					<JackpotStar x={0} y={0} scale={star.scale} index={index} />
				</motion.g>
			))}
		</AnimatePresence>
	);
};
