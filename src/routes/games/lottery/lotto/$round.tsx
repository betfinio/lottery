import { PlayerStatusForRound } from '@/src/components/round/PlayerStatusForRound/PlayerStatusForRound';
import { RoundChainDetails } from '@/src/components/round/RoundChainDetails';
import { RoundHeader } from '@/src/components/round/RoundHeader';
import { RoundJackpots } from '@/src/components/round/RoundJackpots/RoundJackpots';
import { RoundPlayerDetails } from '@/src/components/round/RoundPlayerDetails';
import { RoundTotalsDetails } from '@/src/components/round/RoundTotalsDetails';
import { Toaster } from '@betfinio/components/ui';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/games/lottery/lotto/$round')({
	component: HistoryRoundPage,
});

function HistoryRoundPage() {
	return (
		<>
			<div className="lottery   p-2 md:p-3 lg:p-4 f 2xl:pr-0">
				<RoundHeader />
				<RoundTotalsDetails />
				<div className="mt-4 md:min-h-[541px] flex justify-center items-center">
					<PlayerStatusForRound />
				</div>
				<div className="mt-4">
					<RoundJackpots />
				</div>
				<RoundChainDetails />
			</div>
			<Toaster />
		</>
	);
}
