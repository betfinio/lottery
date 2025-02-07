import CreateTicket from '@/src/components/CreateTicket.tsx';
import DrawInfo from '@/src/components/DrawInfo.tsx';
import PlaceBet from '@/src/components/PlaceBet.tsx';
import Header from '@/src/components/shared/Header.tsx';
import TablesWrapper from '@/src/components/tables/TablesWrapper';
import { useSelectedRound } from '@/src/lib/query';
import { useRoundState } from '@/src/lib/query/state';
import { RoundState } from '@/src/lib/types';
import { cn } from '@betfinio/components';
import { useMediaQuery } from '@betfinio/components/hooks';
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
	const { isMobile } = useMediaQuery();

	return (
		<div className={'lottery overflow-hidden'}>
			<div className={'p-2 md:p-3 lg:p-4 flex flex-col items-center gap-2 md:gap-3 lg:gap-4 2xl:pr-0'}>
				<Header />
				<div className={'grid grid-cols-6 grid-rows-2 md:grid-rows-1 grid-auto-rows gap-4 w-full md:h-[593px]'}>
					<AnimatePresence mode={'popLayout'}>
						<motion.div
							className={cn('col-span-6 md:col-span-2', {
								'hidden md:inline md:col-start-1': showPlaceBet,
								'md:col-start-2': !showPlaceBet,
							})}
							initial={{
								rotateY: isMobile ? (!showPlaceBet ? -180 : 0) : 0,
							}}
							animate={{
								rotateY: isMobile ? (!showPlaceBet ? 0 : 180) : 0,
							}}
							exit={{
								rotateY: isMobile ? (!showPlaceBet ? 180 : 0) : 0,
							}}
							transition={{
								duration: 0.3,
							}}
							key="create"
						>
							<CreateTicket />
						</motion.div>
						<motion.div
							initial={{
								rotateY: isMobile ? -180 : 0,
							}}
							animate={{
								rotateY: isMobile ? (showPlaceBet ? 0 : 180) : 0,
							}}
							exit={{
								rotateY: isMobile ? (showPlaceBet ? 180 : 0) : 0,
							}}
							className={cn('col-span-6 md:col-span-2', {
								hidden: !showPlaceBet,
							})}
							transition={{
								duration: 0.3,
							}}
							key="place"
						>
							<PlaceBet />
						</motion.div>
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
