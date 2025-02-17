import { BetValue } from '@betfinio/components/shared';
import { Button } from '@betfinio/components/ui';
import { useNavigate } from '@tanstack/react-router';
import { TicketIcon, UserIcon } from 'lucide-react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StatBox } from '../../shared/StatBox';
export const PlayerDidNotWin: FC = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const navigate = useNavigate();
	return (
		<div className="h-[430px]  min-w-[388px] border-2 border-aura rounded-lg p-8 flex flex-col items-center shadow-[0_0_10px_0] shadow-aura">
			<div className="text-2xl font-semibold mb-11">{t('roundIsOver')}</div>
			<div className="flex flex-col gap-4 items-center mb-11">
				<div className="text-base font-semibold">{t('youCouldWin')}</div>
				<div className="text-2xl font-semibold text-secondary-foreground">
					<BetValue value={200000} withIcon withMillify={false} />
				</div>
			</div>
			<div className="flex gap-4 items-center mb-11">
				<StatBox label="Tickets" value={100} icon={<TicketIcon className="w-4 h-4" />} />
				<StatBox label="Players" value={100} icon={<UserIcon className="w-4 h-4" />} />
				<StatBox label="Volume" value={<BetValue value={BigInt(100000)} withIcon />} />
			</div>
			<div className="mt-auto w-full">
				<Button onClick={() => navigate({ to: '/games/lottery/lotto' })} className="w-full" variant="default">
					{t('backToCurrentRound')}
				</Button>
			</div>
		</div>
	);
};
