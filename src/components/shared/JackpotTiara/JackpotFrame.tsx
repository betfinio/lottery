import { cn } from '@betfinio/components';
import { forwardRef } from 'react';
import { BfIcon } from './BfIcon';
import { GradientImage } from './GradientImage';
import { JackpotStarsSpread } from './JackpotStarsSpread';

export interface JackpotFrameProps extends React.ComponentPropsWithoutRef<'svg'> {
	animateStars?: boolean;
}
export const JackpotFrame = forwardRef<SVGSVGElement, JackpotFrameProps>(({ className = 'text-gold', animateStars = false, ...props }, ref) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			width="320"
			height="208"
			viewBox="0 0 320 208"
			fill="none"
			role="presentation"
			ref={ref}
			{...props}
			className={cn(className)}
		>
			<g clipPath="url(#clip0_6001_54972)">
				<rect y="18" width="320" height="190" fill="url(#pattern0_6001_54972)" />
				<path
					d="M159.999 193.578C158.963 193.578 157.933 193.436 156.935 193.156L23.0922 155.299C20.6934 154.621 18.5809 153.18 17.0743 151.194C15.5677 149.208 14.749 146.785 14.7422 144.292V81.7349C14.7428 79.2385 15.5609 76.8109 17.0713 74.8233C18.5817 72.8356 20.7014 71.3971 23.1065 70.7278L156.921 32.8706C157.923 32.5921 158.959 32.4504 159.999 32.4492C161.035 32.4495 162.066 32.5913 163.064 32.8706L296.906 70.7278C299.306 71.405 301.419 72.846 302.926 74.8323C304.433 76.8185 305.251 79.2418 305.256 81.7349V144.264C305.249 146.758 304.428 149.182 302.919 151.169C301.409 153.155 299.294 154.595 296.892 155.271L163.078 193.128C162.077 193.416 161.041 193.567 159.999 193.578Z"
					stroke="white"
					strokeWidth="4"
					filter="drop-shadow(0 0 6px currentColor)"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<rect x="1.42773" y="19.4297" width="317.143" height="187.143" fill="url(#pattern1_6001_54972)" />
				<defs>
					<linearGradient id="gradient" x1="100%" y1="0%" x2="0%" y2="0%">
						<stop offset="0%" stopColor="#1d1a3d" />
						<stop offset="40%" stopColor="#7366ff" />
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
				<clipPath id="clip0_6001_54972">
					<rect width="320" height="208" fill="white" />
				</clipPath>
				<GradientImage />
			</defs>
		</svg>
	);
});
