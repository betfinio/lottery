import CreateTicket from '@/src/components/CreateTicket.tsx';
import DrawInfo from '@/src/components/DrawInfo.tsx';
import PlaceBet from '@/src/components/PlaceBet.tsx';
import Header from '@/src/components/shared/Header.tsx';
import Watchers from '@/src/components/shared/Watchers';
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
	component: LotteryPage,
});

export function LotteryPage() {
	const { data: round } = useSelectedRound();
	const { state } = useRoundState(round?.address);
	const showPlaceBet = state === RoundState.PLACING;
	const { isMobile, isTablet } = useMediaQuery();

	const isRotate = isMobile || isTablet;

	return (
		<div className={'lottery overflow-hidden'}>
			<Watchers />
			<div className={'p-2 md:p-3 lg:p-4 flex flex-col items-center gap-2 md:gap-3 lg:gap-4 2xl:pr-0'}>
				<Header />
				<div className={'grid grid-cols-6 grid-rows-2 md:grid-rows-1 grid-auto-rows gap-6 w-full md:h-[593px]'}>
					<AnimatePresence mode={'popLayout'}>
						<motion.div
							className={cn('col-span-6 md:col-span-3 xl:col-span-2', {
								'hidden xl:inline xl:col-start-1 ': showPlaceBet,
								'md:col-start-1 xl:col-start-2': !showPlaceBet,
							})}
							initial={{
								rotateY: isRotate ? (!showPlaceBet ? -180 : 0) : 0,
							}}
							animate={{
								rotateY: isRotate ? (!showPlaceBet ? 0 : 180) : 0,
							}}
							exit={{
								rotateY: isRotate ? (!showPlaceBet ? 180 : 0) : 0,
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
								rotateY: isRotate ? -180 : 0,
							}}
							animate={{
								rotateY: isRotate ? (showPlaceBet ? 0 : 180) : 0,
							}}
							exit={{
								rotateY: isRotate ? (showPlaceBet ? 180 : 0) : 0,
							}}
							className={cn('col-span-6 md:col-span-3 xl:col-span-2', {
								hidden: !showPlaceBet,
							})}
							transition={{
								duration: 0.3,
							}}
							key="place"
						>
							<PlaceBet />
						</motion.div>
						<motion.div className={'col-span-6 md:col-span-3 xl:col-span-2'} key="draw">
							<DrawInfo />
						</motion.div>
					</AnimatePresence>
				</div>
				<div className="my-4 w-full">
					<TablesWrapper />
				</div>
			</div>
			<Toaster />
		</div>
	);
}
