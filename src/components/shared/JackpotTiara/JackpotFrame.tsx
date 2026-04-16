import { cn } from '@betfinio/components';
import { BfIcon } from './BfIcon';
import { JackpotStarsSpread } from './JackpotStarsSpread';

export interface JackpotFrameProps extends React.ComponentPropsWithoutRef<'svg'> {
	animateStars?: boolean;
}
export const JackpotFrame = ({ className = 'text-[var(--gold)]', animateStars = false, ...props }: JackpotFrameProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			width="320"
			height="208"
			viewBox="0 0 320 208"
			fill="none"
			role="presentation"
			{...props}
			className={cn(className)}
		>
			<g clipPath="url(#clip0_6001_54972)">
				<defs>
					<linearGradient id="gradient" x1="100%" y1="0%" x2="0%" y2="0%">
						<stop offset="0%" stopColor="#1d1a3d" />
						<stop offset="40%" stopColor="#3c367c" />
						<stop offset="100%" stopColor="#1d1a3d" />
					</linearGradient>
				</defs>
				<path
					d="M160 192.15C159.093 192.151 158.189 192.028 157.315 191.786L23.4862 153.893C21.383 153.307 19.5296 152.048 18.2089 150.31C16.8882 148.571 16.1728 146.448 16.1719 144.265V81.7361C16.1712 79.5515 16.8859 77.4268 18.2067 75.6868C19.5276 73.9468 21.3819 72.6871 23.4862 72.1004L157.308 34.2433C159.068 33.7575 160.926 33.7575 162.686 34.2433L296.515 72.1075C298.618 72.6939 300.471 73.9525 301.792 75.6911C303.113 77.4297 303.828 79.5528 303.829 81.7361V144.265C303.823 146.447 303.105 148.569 301.785 150.307C300.466 152.046 298.615 153.307 296.515 153.9L162.693 191.758C161.818 192.013 160.912 192.145 160 192.15Z"
					stroke="white"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="url(#gradient)"
				/>

				<BfIcon />
			</g>
			<JackpotStarsSpread animate={animateStars} />

			<defs xmlns="http://www.w3.org/2000/svg">
				<pattern id="pattern1_6001_54972" patternContentUnits="objectBoundingBox" width="1" height="1">
					<use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#image1_6001_54972" transform="scale(0.00225225 0.00381679)" />
				</pattern>
			</defs>
		</svg>
	);
};
