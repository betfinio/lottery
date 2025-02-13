import type { ActiveTicketMode, ILine, IRoundTicket } from '@/src/lib/types';
import { type FC, useState } from 'react';
import Ticket from '../../Ticket';
import { JackpotTiara } from '../../shared/JackpotTiara/JackpotTiara';
import Pagination from '../../shared/Pagination';

export const PlayerWon: FC = () => {
	return (
		<div className="h-[430px] pt-[111px]">
			<div className="border-2 border-orange-500 h-full rounded-lg relative pt-[104px]">
				<div className="absolute h-[208px] w-[320px] -top-[104px] left-1/2 -translate-x-1/2">
					<JackpotTiara />
				</div>
				<Pagination
					items={[
						{
							betAddress: '0x123',
							lines: [
								{ symbol: 1, numbers: [1, 2, 3, 4, 5, 6] },
								{ symbol: 2, numbers: [1, 2, 3, 4, 5, 6] },
							],
							player: '0x123',
							round: '0x123',
							token: 1,
						},
						{
							betAddress: '0x1234',
							lines: [
								{ symbol: 1, numbers: [1, 2, 3, 4, 5, 6] },
								{ symbol: 2, numbers: [1, 2, 3, 4, 5, 6] },
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
