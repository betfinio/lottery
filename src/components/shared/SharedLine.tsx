import { NumberComponent, SymbolElement } from '@/src/components/Line.tsx';
import { useDraftLines } from '@/src/lib/query';
import type { ILine } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { useEffect, useMemo } from 'react';

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
	const symbolControls = useAnimation();
	const { data: draftLines = [] } = useDraftLines();

	const filledLines = useMemo(() => draftLines.filter((line) => line.numbers.every((n) => n !== 0)), [draftLines]);

	const filled3 = useMemo(() => filledLines.length >= 3, [filledLines]);

	useEffect(() => {
		if (symbolUnlocked && filled3) {
			symbolControls.start({
				scale: [1, 1.2, 1],
				boxShadow: ['0 0 0 0 hsl(var(--primary))', '0 0 20px 10px hsl(var(--primary))', '0 0 20px 1px hsl(var(--primary))'],
				transition: {
					duration: 1.6,
					times: [0, 0.5, 0.6],
					ease: 'easeInOut',
				},
			});
		} else {
			symbolControls.start({
				scale: 1,
				boxShadow: '0 0 0 0 hsl(var(--primary))',
			});
		}
	}, [symbolUnlocked, filled3]);

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
				animate={symbolControls}
			>
				<NumberComponent isSymbol className={symbolClassName}>
					<motion.div
						key={line.symbol + line.numbers.join(',')}
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
				</NumberComponent>
			</motion.div>
		</div>
	);
}

export default SharedLine;
