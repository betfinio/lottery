import { Certik, Polygon } from '@betfinio/components/icons';
import { BetValue } from '@betfinio/components/shared';
import { Dialog, DialogTrigger } from '@betfinio/components/ui';
import { TicketIcon } from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Countdown from '@/src/components/Countdown.tsx';
import { ETHSCAN, LOTTERY } from '@/src/globals.ts';
import { getRoundTimes, useInterval, useRoundDetails, useRoundOffset } from '@/src/lib/query';
import type { IRound } from '@/src/lib/types.ts';
import { JackpotFrame } from '../shared/JackpotTiara/JackpotFrame';
import PayoutContent from '../shared/PayoutContent';
import { StatBox } from '../shared/StatBox';

interface CurrentRoundProps {
	roundId: bigint;
}

const CurrentRound: FC<CurrentRoundProps> = ({ roundId }) => {
	const { t } = useTranslation('lottery');
	const { data: round } = useRoundDetails(roundId);
	const { data: interval = 0n } = useInterval();
	const { data: offset = 0n } = useRoundOffset();

	const finish = interval > 0n ? getRoundTimes(roundId, interval, offset).end : 0;

	const [displayedVolume, setDisplayedVolume] = useState(0n);
	const animationRef = useRef<NodeJS.Timeout>(undefined);

	useEffect(() => {
		if (!round) return;
		if (animationRef.current) {
			clearTimeout(animationRef.current);
		}

		const startValue = displayedVolume;
		const endValue = round.betsAmount;
		const diff = endValue - startValue;
		const steps = 100;
		const stepValue = diff / BigInt(steps || 1);
		let currentStep = 0;

		const animate = () => {
			currentStep++;
			if (currentStep <= steps) {
				setDisplayedVolume(startValue + stepValue * BigInt(currentStep));
				animationRef.current = setTimeout(animate, 1000 / steps);
			}
		};

		animate();

		return () => {
			if (animationRef.current) {
				clearTimeout(animationRef.current);
			}
		};
	}, [round?.betsAmount]);

	if (!round) return null;

	const renderPartners = () => (
		<div className="w-full grid grid-cols-2 text-muted-foreground">
			<PartnerLink text="Open Source" icon={<Polygon className="w-6 h-6 text-purple-700" />} link={`${ETHSCAN}/address/${LOTTERY}`} />
			<PartnerLink text="Audited by" icon={<Certik className="w-6 h-6 text-foreground" />} link={'https://skynet.certik.com/projects/betfin'} />
		</div>
	);

	return (
		<div className="p-3 flex flex-col gap-4 justify-between h-full">
			<div className="flex flex-col gap-3 h-10">
				<div className="w-full text-center text-purple-box">Next Draw #{round.roundId.toString()}</div>
				{round.status === 'open' && <Countdown finish={finish} />}
			</div>
			<Dialog>
				<DialogTrigger className={'flex flex-col items-center'}>
					<div className="relative flex items-center justify-center">
						<JackpotFrame animateStars className="text-[var(--gold)]" />
						<div className="absolute top-20 text-2xl text-secondary-foreground flex flex-col items-center">
							<div className="text-foreground text-lg">{t('totalWinnings')}</div>
							<div className="flex flex-row gap-1 items-center">
								<BetValue value={displayedVolume} withMillify={false} iconClassName="w-5 h-5" /> BET
							</div>
						</div>
					</div>
				</DialogTrigger>
				<PayoutContent />
			</Dialog>

			{renderPartners()}
			<Stats round={round} />
		</div>
	);
};

interface PartnerLinkProps {
	text: string;
	icon: React.ReactNode;
	link: string;
}

const PartnerLink: FC<PartnerLinkProps> = ({ text, icon, link }) => (
	<a href={link} target="_blank" rel="noreferrer" className="flex flex-row gap-1 items-center text-sm underline underline-offset-4 justify-center">
		{text} {icon}
	</a>
);

function Stats({ round }: { round: IRound }) {
	const { t } = useTranslation('lottery', { keyPrefix: 'round.current.stats' });
	const [displayedBets, setDisplayedBets] = useState(0);
	const [displayedVolume, setDisplayedVolume] = useState(0n);
	const animationRef = useRef<NodeJS.Timeout>(undefined);

	useEffect(() => {
		if (animationRef.current) {
			clearTimeout(animationRef.current);
		}

		const steps = 100;
		let currentStep = 0;

		const betsStepValue = (round.betsCount - displayedBets) / steps;
		const volumeStepValue = (round.betsAmount - displayedVolume) / BigInt(steps || 1);

		const animate = () => {
			currentStep++;
			if (currentStep <= steps) {
				setDisplayedBets(Math.floor(displayedBets + betsStepValue * currentStep));
				setDisplayedVolume(displayedVolume + volumeStepValue * BigInt(currentStep));
				animationRef.current = setTimeout(animate, 1000 / steps);
			}
		};

		animate();

		return () => {
			if (animationRef.current) {
				clearTimeout(animationRef.current);
			}
		};
	}, [round.betsCount, round.betsAmount]);

	return (
		<div className="grid grid-cols-2 gap-3">
			<StatBox label={t('tickets')} value={displayedBets} icon={<TicketIcon className="w-4 h-4" />} />
			<StatBox label={t('volume')} value={<BetValue value={displayedVolume} withIcon />} />
		</div>
	);
}

export default CurrentRound;
