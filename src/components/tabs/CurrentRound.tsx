// @ts-ignore
import Jackpot from '@/src/assets/jackpot.svg?react';
import Countdown from '@/src/components/Countdown.tsx';
import { MAX_SHARES } from '@/src/globals.ts';
import { useAdditionalJackpot, usePotentialJackpot, useRoundFinish, useRoundStatus } from '@/src/lib/query';
import { type IRound, RoundStatus } from '@/src/lib/types.ts';
import { truncateEthAddress } from '@betfinio/abi';
import { Certik, Polygon } from '@betfinio/components/icons';
import { BetValue } from '@betfinio/components/shared';
import { HexagonIcon, TicketIcon, UserIcon } from 'lucide-react';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';

interface CurrentRoundProps {
	round: IRound;
}

const CurrentRound: FC<CurrentRoundProps> = ({ round }) => {
	const { data: finish = 0 } = useRoundFinish(round.address);
	const { data: status } = useRoundStatus(round.address);
	const { data: additionalJackpot = 0n } = useAdditionalJackpot();
	const { data: potentialJackpot = 0n } = usePotentialJackpot(round.address);
	const [displayedJackpot, setDisplayedJackpot] = useState(round.ticketPrice * BigInt(MAX_SHARES));
	const animationRef = useRef<NodeJS.Timer>();

	const totalJackpot = useMemo(
		() => round.ticketPrice * BigInt(MAX_SHARES) + additionalJackpot + potentialJackpot,
		[round, additionalJackpot, potentialJackpot],
	);

	useEffect(() => {
		if (animationRef.current) {
			clearTimeout(animationRef.current);
		}

		const startValue = displayedJackpot;
		const endValue = totalJackpot;
		const diff = endValue - startValue;
		const steps = 100;
		const stepValue = diff / BigInt(steps);
		let currentStep = 0;

		const animate = () => {
			currentStep++;
			if (currentStep <= steps) {
				setDisplayedJackpot(startValue + stepValue * BigInt(currentStep));
				animationRef.current = setTimeout(animate, 1000 / steps);
			}
		};

		animate();

		return () => {
			if (animationRef.current) {
				clearTimeout(animationRef.current);
			}
		};
	}, [totalJackpot]);

	const renderStats = () => (
		<div className="grid grid-cols-3 gap-3">
			<StatBox label="Tickets" value={round.linesCount} icon={<TicketIcon className="w-4 h-4" />} />
			<StatBox label="Players" value={round.ticketCount} icon={<UserIcon className="w-4 h-4" />} />
			<StatBox label="Volume" value={<BetValue value={BigInt(round.bank)} withIcon />} />
		</div>
	);

	const renderPartners = () => (
		<div className="w-full grid grid-cols-3 text-muted-foreground">
			<PartnerLink text="Open Source" icon={<Polygon className="w-6 h-6 text-purple-700" />} />
			<PartnerLink text="Powered by" icon={<HexagonIcon className="w-6 h-6 text-blue-400 stroke-[4px]" />} />
			<PartnerLink text="Audited by" icon={<Certik className="w-6 h-6 text-foreground" />} />
		</div>
	);

	return (
		<div className="p-3 flex flex-col gap-4 justify-between h-full">
			<div className="flex flex-col gap-3">
				<div className="w-full text-center text-purple-box">Next Draw {truncateEthAddress(round.address).toLowerCase()}</div>
				{status === RoundStatus.BETTING && <Countdown finish={finish} />}
			</div>

			<div className="relative flex items-center justify-center">
				<div className="scale-110">
					<Jackpot />
				</div>
				<div className="absolute top-24 text-2xl text-secondary-foreground">
					<BetValue value={displayedJackpot} withIcon withMillify={false} iconClassName="w-5 h-5" />
				</div>
			</div>

			{renderPartners()}
			{renderStats()}
		</div>
	);
};

interface StatBoxProps {
	label: string;
	value: React.ReactNode;
	icon?: React.ReactNode;
}

const StatBox: FC<StatBoxProps> = ({ label, value, icon }) => (
	<div className="bg-secondary text-secondary-foreground rounded-xl flex items-center justify-between p-4 py-2 flex-col">
		<span className="text-muted-foreground text-sm">{label}</span>
		<div className="flex flex-row items-center gap-1">
			{value} {icon}
		</div>
	</div>
);

interface PartnerLinkProps {
	text: string;
	icon: React.ReactNode;
}

const PartnerLink: FC<PartnerLinkProps> = ({ text, icon }) => (
	<div className="flex flex-row gap-1 items-center text-sm underline underline-offset-4 justify-center">
		{text} {icon}
	</div>
);

export default CurrentRound;
