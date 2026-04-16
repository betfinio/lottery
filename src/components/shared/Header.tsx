import { PayTable } from '@betfinio/components/icons';
import { Dialog, DialogTrigger } from '@betfinio/components/ui';
import { useNavigate } from '@tanstack/react-router';
import { useChatbot } from 'betfinio_context/lib/context';
import { BookIcon, HeadsetIcon } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getRoundTimes, useCurrentRoundId, useInterval, useRoundOffset, useSelectedRound } from '@/src/lib/query';
import Countdown from '../Countdown';
import Ticket from '../icons/Ticket';
import PayoutContent from './PayoutContent';

const Header = () => {
	const { t } = useTranslation('lottery');
	const { data: selectedRoundId } = useSelectedRound();
	const roundId = selectedRoundId ?? 0n;
	const { data: interval = 0n } = useInterval();
	const { data: offset = 0n } = useRoundOffset();
	const { refetch: refetchCurrentRoundId } = useCurrentRoundId();
	const { toggle } = useChatbot();
	const navigate = useNavigate();

	const { end: finish } = getRoundTimes(roundId, interval, offset);

	const handleReport = () => {
		toggle();
	};
	const handleCountdownFinish = useCallback(async () => {
		await refetchCurrentRoundId();
		await navigate({
			to: '/games/lottery/lotto/$round',
			params: { round: roundId.toString() },
		});
	}, [refetchCurrentRoundId, navigate, roundId]);
	return (
		<div className={'w-full border border-border rounded-lg bg-background-lighter p-2 md:p-3 lg:p-4 flex flex-row justify-between min-h-[70px] items-center'}>
			<div className="flex flex-row items-center justify-center gap-2 lg:gap-3">
				<Ticket className="w-10 h-10 text-primary" />
				<div className="flex flex-col gap-0">
					<div>{t('lotto5of25')}</div>
					<div className="text-sm text-muted-foreground">{t('tuesdayAndFriday')}</div>
				</div>
			</div>
			<div className="flex flex-row items-center justify-center gap-2 lg:gap-3">
				<Dialog>
					<DialogTrigger className={'flex flex-col items-center text-secondary-foreground hover:text-secondary-foreground lg:text-foreground duration-300'}>
						<PayTable className={'w-6 h-6'} />
						<span className={'hidden sm:inline text-xs'}>{t('paytable')}</span>
					</DialogTrigger>
					<PayoutContent />
				</Dialog>
				<a
					target={'_blank'}
					href={'https://betfin.gitbook.io/betfin-public/games-manual/games-guide/lotto'}
					className={
						'flex flex-col items-center justify-center cursor-pointer text-secondary-foreground hover:text-secondary-foreground lg:text-foreground duration-300'
					}
					rel="noreferrer"
				>
					<BookIcon className={'w-6 h-6'} />
					<span className={'hidden sm:inline text-xs'}>{t('howToPlay')}</span>
				</a>
				<div className={'flex flex-col items-center text-secondary-foreground group lg:text-foreground hover:text-secondary-foreground text-xs cursor-pointer'}>
					<HeadsetIcon className={'w-6 h-6'} onClick={handleReport} />
					<span className={'hidden md:block'}>{t('report')}</span>
				</div>
			</div>
			<div className="hidden">
				<Countdown onFinish={handleCountdownFinish} finish={finish || Number.MAX_SAFE_INTEGER} />
			</div>
		</div>
	);
};

export default Header;
