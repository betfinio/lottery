import { useGetRoundFromParams, useLinesCount, useTicketPrice } from '@/src/lib/query';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Bag } from '@betfinio/ui/dist/icons';
import { useTranslation } from 'react-i18next';
import Ticket from '../icons/Ticket.tsx';
import WinningLine from '../tables/columns/WinningLine';
export function RoundTotalsDetails() {
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	const round = useGetRoundFromParams();
	const { data: lines = 10n, isLoading: isLinesLoading } = useLinesCount(round);
	const { data: price = 99n ** 8n, isLoading: isPriceLoading } = useTicketPrice(round);
	const bank = lines * price;
	return (
		<div className="grid grid-cols-1 md:grid-cols-3  w-full gap-2 md:gap-4">
			<div className="border border-border rounded-lg p-2 py-6 flex flex-row items-center justify-center gap-4">
				<Ticket className="w-16 h-16" />
				<div className="flex flex-col items-center">
					<BetValue className={cn('text-xl', { 'blur animated-pulse': isLinesLoading || isPriceLoading })} value={bank} withIcon />
					<div className={cn({ 'blur animated-pulse': isLinesLoading })}>
						{Number(lines)} {t('lines')}
					</div>
					<div className="text-tertiary-foreground">{t('totalBets')}</div>
				</div>
			</div>
			<div className="border border-border rounded-lg p-2 py-6 flex flex-row items-center justify-center gap-4">
				<div className="flex flex-col items-center">
					<div className="text-tertiary-foreground mb-2">{t('luckyNumbers')}</div>
					<WinningLine round={round} />
				</div>
			</div>
			<div className="border border-border rounded-lg p-2 py-6 flex flex-row items-center justify-center gap-4">
				<Bag className={'w-16 text-secondary-foreground'} />
				<div className="flex flex-col items-center">
					<BetValue className={cn('text-xl text-success', { 'blur animated-pulse': isLinesLoading || isPriceLoading })} value={bank} withIcon />
					<div className="text-tertiary-foreground">{t('paidToStaking')}</div>
				</div>
			</div>
		</div>
	);
}
