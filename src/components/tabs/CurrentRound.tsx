// @ts-ignore

import { truncateEthAddress } from '@betfinio/abi';
import { Certik, Polygon } from '@betfinio/components/icons';
import { BetValue } from '@betfinio/components/shared';
import { Dialog, DialogTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';
import { HelpCircleIcon, HexagonIcon, TicketIcon, UserIcon } from 'lucide-react';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Countdown from '@/src/components/Countdown.tsx';
import { ENVIRONMENT, ETHSCAN, LOTTERY_ADDRESS, MAX_SHARES } from '@/src/globals.ts';
import { useAdditionalJackpot, usePotentialJackpot, useRoundFinish, useRoundStatus, useSubscriptionId } from '@/src/lib/query';
import { type IRound, RoundStatus } from '@/src/lib/types.ts';
import { JackpotFrame } from '../shared/JackpotTiara/JackpotFrame';
import PayoutContent from '../shared/PayoutContent';
import { StatBox } from '../shared/StatBox';

interface CurrentRoundProps {
	round: IRound;
}

const CurrentRound: FC<CurrentRoundProps> = ({ round }) => {
	const { t } = useTranslation('lottery');
	const { data: finish = 0 } = useRoundFinish(round.address);
	const { data: status } = useRoundStatus(round.address);
	const { data: additionalJackpot = 0n } = useAdditionalJackpot();
	const { data: potentialJackpot = 0n } = usePotentialJackpot(round.address);
	const { data: subscriptionId } = useSubscriptionId();
	const [displayedJackpot, setDisplayedJackpot] = useState(round.ticketPrice * BigInt(MAX_SHARES));
	const animationRef = useRef<NodeJS.Timeout>(undefined);
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

	const network = ENVIRONMENT === 'production' ? 'polygon' : 'polygon-amoy';
	const vrfLink = `https://vrf.chain.link/${network}#/side-drawer/subscription/${network}/${subscriptionId}`;

	const renderPartners = () => (
		<div className="w-full grid grid-cols-3 text-muted-foreground">
			<PartnerLink text="Open Source" icon={<Polygon className="w-6 h-6 text-purple-700" />} link={`${ETHSCAN}/address/${LOTTERY_ADDRESS}`} />
			<PartnerLink text="Powered by" icon={<HexagonIcon className="w-6 h-6 text-blue-400 stroke-[4px]" />} link={vrfLink} />
			<PartnerLink text="Audited by" icon={<Certik className="w-6 h-6 text-foreground" />} link={'https://skynet.certik.com/projects/betfin'} />
		</div>
	);

	return (
		<div className="p-3 flex flex-col gap-4 justify-between h-full">
			<div className="flex flex-col gap-3 h-10">
				<div className="w-full text-center text-purple-box">Next Draw {truncateEthAddress(round.address).toLowerCase()}</div>
				{status === RoundStatus.BETTING && <Countdown finish={finish} />}
			</div>
			<Dialog>
				<DialogTrigger className={'flex flex-col items-center'}>
					<div className="relative flex items-center justify-center">
						<JackpotFrame animateStars className="text-gold" />
						<div className="absolute top-20 text-2xl text-secondary-foreground flex flex-col items-center">
							<div className="text-foreground text-lg">{t('totalWinnings')}</div>
							<div className="flex flex-row gap-1 items-center">
								<BetValue value={displayedJackpot} withMillify={false} iconClassName="w-5 h-5" /> BET
							</div>
							<div className="text-muted-foreground text-sm">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="flex flex-row gap-1 items-center text-xs">
												Incl. 4% bonus of <BetValue value={additionalJackpot + potentialJackpot} withIcon={false} /> <HelpCircleIcon className="w-3 h-3" />
											</div>
										</TooltipTrigger>
										<TooltipContent>Additional jackpot is 4% of all bets cumulative from all rounds.</TooltipContent>
									</Tooltip>
								</TooltipProvider>
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
	const [displayedLines, setDisplayedLines] = useState(0);
	const [displayedTickets, setDisplayedTickets] = useState(0);
	const [displayedVolume, setDisplayedVolume] = useState(0n);
	const animationRef = useRef<NodeJS.Timeout>(undefined);

	useEffect(() => {
		if (animationRef.current) {
			clearTimeout(animationRef.current);
		}

		const steps = 100;
		let currentStep = 0;

		const linesStepValue = (round.linesCount - displayedLines) / steps;
		const ticketsStepValue = (round.ticketCount - displayedTickets) / steps;
		const volumeStepValue = (BigInt(round.bank) - displayedVolume) / BigInt(steps);

		const animate = () => {
			currentStep++;
			if (currentStep <= steps) {
				setDisplayedLines(Math.floor(displayedLines + linesStepValue * currentStep));
				setDisplayedTickets(Math.floor(displayedTickets + ticketsStepValue * currentStep));
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
	}, [round.linesCount, round.ticketCount, round.bank]);

	return (
		<div className="grid grid-cols-3 gap-3">
			<StatBox label={t('lines')} value={displayedLines} icon={<TicketIcon className="w-4 h-4" />} />
			<StatBox label={t('tickets')} value={displayedTickets} icon={<UserIcon className="w-4 h-4" />} />
			<StatBox label={t('volume')} value={<BetValue value={displayedVolume} withIcon />} />
		</div>
	);
}

export default CurrentRound;
