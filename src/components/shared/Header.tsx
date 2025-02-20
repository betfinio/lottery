import { DYNAMIC_STAKING_ADDRESS } from '@/src/globals';
import { useSelectedRound, useTicketPrice } from '@/src/lib/query';
import type { ILine } from '@/src/lib/types';
import { partlyEquals } from '@/src/lib/utils';
import { cn } from '@betfinio/components';
import { useMediaQuery } from '@betfinio/components/hooks';
import { Bag } from '@betfinio/components/icons';
import { BetValue } from '@betfinio/components/shared';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@betfinio/components/ui';
import { useChatbot } from 'betfinio_context/lib/context';
import { useBalance } from 'betfinio_context/lib/query';
import { AlertCircle, AlertTriangleIcon, CircleHelp, XIcon } from 'lucide-react';
import { NumberComponent, SymbolElement } from '../Line';
import Ticket from '../icons/Ticket';
import { JackpotFrame } from './JackpotTiara/JackpotFrame';
import PayoutContent from './PayoutContent';

const Header = () => {
	const { toggle } = useChatbot();
	const { data: bank = 0n } = useBalance(DYNAMIC_STAKING_ADDRESS);
	const handleReport = () => {
		toggle();
	};
	return (
		<div className={'w-full border border-border rounded-lg bg-background-lighter p-2 md:p-3 lg:p-4 flex flex-row justify-between min-h-[70px] items-center'}>
			<div className="flex flex-row items-center justify-center gap-2 lg:gap-3">
				<Ticket className="w-10 h-10" />
				<div className="flex flex-col gap-0">
					<div>Lotto 5 of 25</div>
					<div className="text-sm text-muted-foreground">Tuesday and Friday</div>
				</div>
				<div className="md:flex flex-row items-center justify-center gap-2 hidden">
					<Bag className="w-10 h-10 text-primary" />
					<div className="flex flex-col gap-0">
						<div className="">Bank</div>
						<BetValue className="text-muted-foreground text-sm" value={(bank * 5n) / 100n} withIcon />
					</div>
				</div>
			</div>
			<div className="flex flex-row items-center justify-center gap-2 lg:gap-3">
				<Dialog>
					<DialogTrigger className={'flex flex-col items-center text-secondary-foreground hover:text-secondary-foreground lg:text-foreground duration-300'}>
						<AlertCircle className={'w-6 h-6'} />
						<span className={'hidden sm:inline text-xs'}>Paytable</span>
					</DialogTrigger>
					<PayoutContent />
				</Dialog>
				<a
					target={'_blank'}
					href={'https://betfin.gitbook.io/betfin-public/v/games-manual/games-guide/predict-game'}
					className={
						'flex flex-col items-center justify-center cursor-pointer text-secondary-foreground hover:text-secondary-foreground lg:text-foreground duration-300'
					}
					rel="noreferrer"
				>
					<CircleHelp className={'w-6 h-6'} />
					<span className={'hidden sm:inline text-xs'}>How to play</span>
				</a>
				<div className={'flex flex-col items-center text-secondary-foreground group lg:text-foreground hover:text-secondary-foreground text-xs cursor-pointer'}>
					<AlertTriangleIcon className={'w-6 h-6'} onClick={handleReport} />
					<span className={'hidden md:block'}>Report</span>
				</div>
			</div>
		</div>
	);
};

export default Header;
