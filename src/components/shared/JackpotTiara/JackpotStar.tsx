import type { FC } from 'react';

interface StarProps {
	x: number;
	y: number;
	scale?: number;
	index: number;
}

export const JackpotStar: FC<StarProps> = ({ x, y, scale = 1, index }) => {
	const gradientIds = {
		paint0: `paint0_linear_star_${index}`,
		paint1: `paint1_linear_star_${index}`,
		paint2: `paint2_linear_star_${index}`,
		paint3: `paint3_linear_star_${index}`,
		paint4: `paint4_linear_star_${index}`,
		paint5: `paint5_linear_star_${index}`,
		paint6: `paint6_linear_star_${index}`,
	};

	// Adjust coordinates relative to star center (0,0)
	const gradientCoords = {
		paint0: { x1: '-5', y1: '-43', x2: '8', y2: '11' },
		paint1: { x1: '-24', y1: '-21', x2: '25', y2: '-21' },
		paint2: { x1: '12', y1: '-12', x2: '18', y2: '13' },
		paint3: { x1: '-10', y1: '1', x2: '-8', y2: '10' },
		paint4: { x1: '29', y1: '-22', x2: '3', y2: '-27' },
		paint5: { x1: '-13', y1: '-7', x2: '-34', y2: '-32' },
		paint6: { x1: '0', y1: '-30', x2: '-8', y2: '-39' },
	};

	return (
		<>
			<g transform={`translate(${x}, ${y}) scale(${scale})`}>
				<path
					d="M0 -46.8L9.273 -28.016L30 -25.004L15.003 -10.382L18.541 10.264L0 0.519L-18.541 10.264L-14.997 -10.382L-30 -25.004L-9.268 -28.016L0 -46.8Z"
					fill="#F2BF18"
				/>
				<g style={{ mixBlendMode: 'multiply' }}>
					<path
						d="M0 -46.8L9.273 -28.016L30 -25.004L15.003 -10.382L18.541 10.264L0 0.519L-18.541 10.264L-14.997 -10.382L-30 -25.004L-9.268 -28.016L0 -46.8Z"
						fill="#F2BF18"
					/>
				</g>
				<path
					style={{ mixBlendMode: 'screen' }}
					d="M-0.002 -41.73L7.624 -26.282L24.67 -23.808L12.334 -11.781L15.244 5.194L-0.002 -2.822L-15.248 5.194L-12.337 -11.781L-24.668 -23.808L-7.622 -26.282L-0.002 -41.73Z"
					fill={`url(#${gradientIds.paint0})`}
				/>
				<path
					style={{ mixBlendMode: 'screen', opacity: 0.4 }}
					d="M-0.001 -41.73L-7.606 -26.282L-24.672 -23.808L-12.336 -11.781L-13.857 -3.015C-4.787 -10.372 9.972 -20.542 24.28 -23.448L24.65 -23.808L7.625 -26.282L-0.001 -41.73Z"
					fill={`url(#${gradientIds.paint1})`}
				/>
				<path
					d="M15.041 -10.422L12.334 -11.781L15.244 5.194L14.702 4.91L17.967 9.96L18.54 10.264L15.001 -10.382L15.041 -10.422Z"
					fill={`url(#${gradientIds.paint2})`}
				/>
				<path d="M0.027 -2.809L-15.245 5.192L-18.297 10.136L0.001 0.517L0.052 0.543V-2.799L0.027 -2.809Z" fill={`url(#${gradientIds.paint3})`} />
				<path
					d="M9.275 -28.015L9.239 -28.086L7.516 -26.504L7.627 -26.281L24.673 -23.807L24.303 -23.447L29.946 -25.008L9.275 -28.015Z"
					fill={`url(#${gradientIds.paint4})`}
				/>
				<path d="M-12.336 -11.78L-24.666 -23.806L-29.625 -24.633L-14.998 -10.381L-15.053 -10.051L-12.336 -11.78Z" fill={`url(#${gradientIds.paint5})`} />
				<path d="M-0.038 -46.715L-9.266 -28.016L-9.291 -28.011L-7.618 -26.282L0.003 -41.731L-0.038 -46.715Z" fill={`url(#${gradientIds.paint6})`} />
			</g>

			<defs>
				<linearGradient
					id={gradientIds.paint0}
					x1={gradientCoords.paint0.x1}
					y1={gradientCoords.paint0.y1}
					x2={gradientCoords.paint0.x2}
					y2={gradientCoords.paint0.y2}
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0.05" stopColor="#FFFF54" />
					<stop offset="0.98" stopColor="#FFFF54" stopOpacity="0" />
				</linearGradient>
				<linearGradient
					id={gradientIds.paint1}
					x1={gradientCoords.paint1.x1}
					y1={gradientCoords.paint1.y1}
					x2={gradientCoords.paint1.x2}
					y2={gradientCoords.paint1.y2}
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0.05" stopColor="#FFFF54" />
					<stop offset="0.98" stopColor="#FFFF54" stopOpacity="0" />
				</linearGradient>
				<linearGradient
					id={gradientIds.paint2}
					x1={gradientCoords.paint2.x1}
					y1={gradientCoords.paint2.y1}
					x2={gradientCoords.paint2.x2}
					y2={gradientCoords.paint2.y2}
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0.05" stopColor="#FFFF54" />
					<stop offset="0.98" stopColor="#FFFF54" stopOpacity="0" />
				</linearGradient>
				<linearGradient
					id={gradientIds.paint3}
					x1={gradientCoords.paint3.x1}
					y1={gradientCoords.paint3.y1}
					x2={gradientCoords.paint3.x2}
					y2={gradientCoords.paint3.y2}
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0.05" stopColor="#FFFF54" />
					<stop offset="0.98" stopColor="#FFFF54" stopOpacity="0" />
				</linearGradient>
				<linearGradient
					id={gradientIds.paint4}
					x1={gradientCoords.paint4.x1}
					y1={gradientCoords.paint4.y1}
					x2={gradientCoords.paint4.x2}
					y2={gradientCoords.paint4.y2}
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0.05" stopColor="#FFFF54" />
					<stop offset="0.98" stopColor="#FFFF54" stopOpacity="0" />
				</linearGradient>
				<linearGradient
					id={gradientIds.paint5}
					x1={gradientCoords.paint5.x1}
					y1={gradientCoords.paint5.y1}
					x2={gradientCoords.paint5.x2}
					y2={gradientCoords.paint5.y2}
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0.02" stopColor="#FFFF54" stopOpacity="0" />
					<stop offset="0.95" stopColor="#FFFF54" />
				</linearGradient>
				<linearGradient
					id={gradientIds.paint6}
					x1={gradientCoords.paint6.x1}
					y1={gradientCoords.paint6.y1}
					x2={gradientCoords.paint6.x2}
					y2={gradientCoords.paint6.y2}
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0.05" stopColor="#FFFF54" />
					<stop offset="0.98" stopColor="#FFFF54" stopOpacity="0" />
				</linearGradient>
			</defs>
		</>
	);
};
