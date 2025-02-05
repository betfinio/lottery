import { NumberComponent, SymbolElement } from '@/src/components/Line.tsx';
import type { ILine } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { AnimatePresence, motion } from 'framer-motion';

function SharedLine({
	line,
	numberClassName,
	symbolClassName,
	className,
	symbolUnlocked,
}: {
	line: ILine;
	numberClassName?: string;
	symbolClassName?: string;
	className?: string;
	symbolUnlocked?: boolean;
}) {
	return (
		<div className={cn('flex gap-2 items-center', className)}>
			{line.numbers
				.sort((a, b) => a - b)
				.map((number, index, array) => (
					<NumberComponent key={index} className={cn(numberClassName, 'overflow-hidden')}>
						<AnimatePresence mode="popLayout" custom={array[index]}>
							<motion.div
								key={number}
								custom={array[index]}
								initial={{
									y: -20,
								}}
								animate={{
									y: 0,
								}}
								exit={{
									y: 20,
								}}
								transition={{
									duration: 0.2,
								}}
							>
								{number || '-'}
							</motion.div>
						</AnimatePresence>
					</NumberComponent>
				))}
			+
			<motion.div
				initial={{
					borderRadius: '50%',
				}}
				animate={
					symbolUnlocked
						? {
								scale: [1, 1.2, 1],
								boxShadow: ['0 0 0 0 hsl(var(--primary))', '0 0 20px 10px hsl(var(--primary))', '0 0 20px 1px hsl(var(--primary))'],
							}
						: {
								scale: 1,
								boxShadow: 'none',
							}
				}
				transition={{
					duration: 1.6,
					times: [0, 0.5, 0.6],
					ease: 'easeInOut',
				}}
			>
				<NumberComponent isSymbol className={symbolClassName}>
					<AnimatePresence mode="popLayout" custom={line.symbol}>
						<motion.div
							key={line.symbol}
							custom={line.symbol}
							initial={{
								y: -20,
							}}
							animate={{
								y: 0,
							}}
							exit={{
								y: 20,
							}}
						>
							<SymbolElement symbol={line.symbol} />
						</motion.div>
					</AnimatePresence>
				</NumberComponent>
			</motion.div>
		</div>
	);
}

export default SharedLine;
