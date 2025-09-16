import { cn } from '@betfinio/components';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { SymbolElement } from '../Line';

interface TicketGridOfSymbolsProps {
	symbol: number;
	numbers: number[];
	changeSymbol: (symbol: number) => void;
}
export const TicketGridOfSymbols: FC<TicketGridOfSymbolsProps> = ({ symbol, numbers, changeSymbol }) => {
	return (
		<div className={'grid grid-cols-5 w-full gap-2'}>
			{Array.from({ length: 5 }).map((_, index) => (
				<motion.div
					key={index}
					onClick={() => changeSymbol(index + 1)}
					animate={
						symbol === index + 1 && numbers.length === 5
							? {
									boxShadow: ['0 0 0 0 var(--primary)', '0 0 20px 10px var(--primary)', '0 0 20px 2px var(--primary)'],
									scale: [1, 1.2, 1],
								}
							: {
									boxShadow: ['0 0 0 0 transparent', '0 0 0 0 transparent', '0 0 0 0 transparent'],
									scale: [1, 1, 1],
								}
					}
					transition={{
						duration: 1.6,
						times: [0, 0.5, 0.7],
						ease: 'easeInOut',
						repeat: 0,
					}}
					className={cn(
						'aspect-4/3 border-2  border-foreground/50 cursor-pointer bg-secondary/90 rounded-lg flex items-center justify-center transition-all hover:border-foreground',
						{
							'border-primary border-2  bg-foreground/30 scale-110': symbol === index + 1,
						},
					)}
				>
					<SymbolElement symbol={symbol === index + 1 ? symbol : index + 1} className={'text-2xl'} />
				</motion.div>
			))}
		</div>
	);
};
