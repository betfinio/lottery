import { PlayerStatusForRound } from '@/src/components/round/PlayerStatusForRound/PlayerStatusForRound';
import { RoundChainDetails } from '@/src/components/round/RoundChainDetails';
import { RoundHeader } from '@/src/components/round/RoundHeader';
import { RoundJackpots } from '@/src/components/round/RoundJackpots/RoundJackpots';
import { RoundPlayerDetails } from '@/src/components/round/RoundPlayerDetails';
import { RoundTotalsDetails } from '@/src/components/round/RoundTotalsDetails';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/games/lottery/lotto/$round')({
	component: HistoryRoundPage,
});

function HistoryRoundPage() {
	return (
		<div className="lottery">
			<RoundHeader />
			<RoundTotalsDetails />
			<div className="mt-4 h-[541px]">
				<PlayerStatusForRound />
			</div>
			<RoundJackpots />
			<RoundChainDetails />
		</div>
	);
}
