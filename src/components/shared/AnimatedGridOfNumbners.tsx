import { cn } from '@betfinio/components';
import { AnimatePresence, motion } from 'framer-motion';
import type { FC } from 'react';

interface AnimatedGridOfNumbnersProps {
	numbers: number[];
	toggleNumber: (number: number) => void;
}

export const AnimatedGridOfNumbners: FC<AnimatedGridOfNumbnersProps> = ({ numbers, toggleNumber }) => {
	return (
		<div className={'grid grid-cols-5 grid-rows-5 grid-flow-col w-full gap-2'}>
			<AnimatePresence mode="popLayout">
				{Array.from({ length: 25 }).map((_, index) => (
					<motion.div
						key={index}
						onClick={() => toggleNumber(index + 1)}
						animate={
							numbers.length === 5 && numbers.includes(index + 1)
								? {
										boxShadow: ['0 0 0 0 rgba(34,197,94,0)', '0 0 20px 10px rgba(34,197,94,0.7)', '0 0 20px 10px rgba(34,197,94,0.1)'],
										scale: [1, 1.2, 1],
									}
								: {
										boxShadow: ['0 0 0 0 rgba(34,197,94,0)', '0 0 0 0 rgba(34,197,94,0)', '0 0 0 0 rgba(34,197,94,0)'],
										scale: [1, 1, 1],
									}
						}
						transition={{
							duration: 1.6,
							times: [0, 0.5, 0.7],
							ease: 'easeInOut',
							repeat: 0,
						}}
						className={cn('aspect-[4/3] cursor-pointer bg-secondary rounded-lg flex items-center justify-center transition-all border-2 border-transparent', {
							'bg-primary text-primary-foreground border-none ': numbers.includes(index + 1),
							'bg-success text-success-foreground border-none': numbers.length === 5 && numbers.includes(index + 1),
							'bg-destructive text-destructive-foreground border-none': numbers.length > 5 && numbers.includes(index + 1),
							'hover:border-success': numbers.length === 4,
							'hover:border-primary': numbers.length < 4,
						})}
					>
						{index + 1}
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
};
