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
	dynamicNumberClassName,
	className,
	symbolUnlocked,
	onClick,
}: {
	line: ILine;
	numberClassName?: string;
	dynamicNumberClassName?: (number: number, index: number) => string;
	symbolClassName?: string;
	className?: string;
	symbolUnlocked?: boolean;
	onClick?: () => void;
}) {
	const symbolControls = useAnimation();
	const { data: draftLines = [] } = useDraftLines();

	const filledLines = useMemo(() => draftLines.filter((line) => line.numbers.every((n) => n !== 0)), [draftLines]);

	const filled3 = useMemo(() => filledLines.length >= 3, [filledLines]);

	useEffect(() => {
		if (symbolUnlocked && filled3 && line.symbol !== 0) {
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
	}, [symbolUnlocked, filled3, line.symbol]);

	return (
		<div className={cn('flex gap-2 items-center ', className)} onClick={onClick}>
			{line.numbers
				.sort((a, b) => a - b)
				.map((number, index, array) => (
					<NumberComponent key={index} className={cn(numberClassName, 'relative', dynamicNumberClassName?.(number, index))}>
						<AnimatePresence mode="wait" custom={array[index]}>
							<motion.div
								key={number}
								custom={array[index]}
								className={'absolute top-[5px]'}
								initial={{
									y: -20,
									opacity: 0,
								}}
								animate={{
									y: 0,
									opacity: 1,
								}}
								exit={{
									y: 20,
									opacity: 0,
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
				<NumberComponent isSymbol className={cn(symbolClassName)}>
					<AnimatePresence mode="wait">
						<motion.div
							key={line.symbol + line.numbers.join(',')}
							custom={line.symbol}
							className={cn('relative', { grayscale: !symbolUnlocked })}
							initial={{
								y: -20,
								opacity: 0,
							}}
							animate={{
								y: 0,
								opacity: 1,
							}}
							exit={{
								y: 20,
								opacity: 0,
							}}
						>
							<SymbolElement symbol={line.symbol} />
						</motion.div>
						<div className={cn({ 'w-8 h-1 bg-destructive absolute rotate-45 top-3.5 left-0': !symbolUnlocked })} />
					</AnimatePresence>
				</NumberComponent>
			</motion.div>
		</div>
	);
}

export default SharedLine;
