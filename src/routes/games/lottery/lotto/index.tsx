import CreateTicket from '@/src/components/CreateTicket.tsx';
import DrawInfo from '@/src/components/DrawInfo.tsx';
import PlaceBet from '@/src/components/PlaceBet.tsx';
import Header from '@/src/components/shared/Header.tsx';
import TablesWrapper from '@/src/components/tables/TablesWrapper';
import { useRoundState } from '@/src/lib/gql/state';
import { useSelectedRound } from '@/src/lib/query';
import { RoundState } from '@/src/lib/types';
import { cn } from '@betfinio/components';
import { Toaster } from '@betfinio/components/ui';
import { createFileRoute } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';

export const Route = createFileRoute('/games/lottery/lotto/')({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: round } = useSelectedRound();
	const { state } = useRoundState(round?.address);
	const showPlaceBet = state === RoundState.PLACING;

	return (
		<div className={'lottery'}>
			<div className={'p-2 md:p-3 lg:p-4 flex flex-col items-center gap-2 md:gap-3 lg:gap-4 2xl:pr-0'}>
				<Header />
				<div className={'grid grid-cols-6 grid-rows-3 md:grid-rows-1 grid-auto-rows gap-4 w-full md:h-[593px]'}>
					<AnimatePresence mode={'wait'}>
						<motion.div
							className={cn('col-span-6 md:col-span-2', {
								'md:col-start-1': showPlaceBet,
								'md:col-start-2': !showPlaceBet,
							})}
							key="create"
						>
							<CreateTicket />
						</motion.div>
						{showPlaceBet && (
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-6 md:col-span-2" key="place">
								<PlaceBet />
							</motion.div>
						)}
						<motion.div className={'col-span-6 md:col-span-2'} key="draw">
							<DrawInfo />
						</motion.div>
					</AnimatePresence>
				</div>
				<TablesWrapper />
			</div>
			<Toaster />
		</div>
	);
}
