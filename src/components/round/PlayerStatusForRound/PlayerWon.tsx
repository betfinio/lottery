import type { IRoundTicket } from '@/src/lib/types';
import { BetValue } from '@betfinio/components/shared';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import Ticket from '../../Ticket';
import { CopyLocation } from '../../shared/CopyLocation';
import { JackpotFrame } from '../../shared/JackpotTiara/JackpotFrame';
import Pagination from '../../shared/Pagination';

export const PlayerWon: FC = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'round' });
	return (
		<div className="min-h-[430px] pt-[111px] min-w-[388px]">
			<div className="border-2 border-aura h-full rounded-lg relative pt-[104px] px-8 shadow-[0_0_10px_0] shadow-aura">
				<div className="absolute h-[208px] w-[320px] -top-[104px] left-1/2 -translate-x-1/2">
					<div className="relative">
						<JackpotFrame animateStars className="text-gold " />
						<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
							<BetValue className="text-secondary-foreground" value={200} />
						</div>
					</div>
				</div>
				<div className="flex gap-2 text-xs justify-between mb-4 text-muted-foreground items-center">
					<div className="flex flex-col items-center">
						<div>{t('betSize')}</div>
						<div className="text-secondary-foreground">200</div>
					</div>
					<div className="flex flex-col items-center">
						<div>{t('multiplicator')}</div>
						<div>1</div>
					</div>
					<div className="text-base">
						<div className="flex items-center gap-2">
							<CopyLocation toastMessage={t('copiedCurrentRoundRef')} className="w-4 h-4" />
							<div>{t('share')}</div>
						</div>
					</div>
				</div>
				<Pagination
					items={[
						{
							betAddress: '0x123',
							lines: [
								{ symbol: 1, numbers: [1, 2, 3, 4, 5] },
								{ symbol: 2, numbers: [1, 2, 3, 4, 5] },
							],
							player: '0x123',
							round: '0x123',
							token: 1,
						},
						{
							betAddress: '0x1234',
							lines: [
								{ symbol: 1, numbers: [1, 2, 3, 4, 5] },
								{ symbol: 2, numbers: [1, 2, 3, 4, 5] },
							],
							player: '0x123',
							round: '0x123',
							token: 12,
						},
					]}
					itemsPerPage={1}
					renderItem={(ticket: IRoundTicket, index: number) => <Ticket old ticket={ticket} key={index} mode="full" />}
				/>
			</div>
		</div>
	);
};
