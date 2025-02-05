import { NumberComponent, SymbolElement } from '@/src/components/Line.tsx';
import type { ILine } from '@/src/lib/types.ts';
import { cn } from '@betfinio/components';

function SharedLine({
	line,
	numberClassName,
	symbolClassName,
	className,
}: { line: ILine; numberClassName?: string; symbolClassName?: string; className?: string }) {
	return (
		<div className={cn('flex gap-2 items-center', className)}>
			{line.numbers
				.sort((a, b) => a - b)
				.map((number, index) => (
					<NumberComponent key={index} className={numberClassName}>
						{number || '-'}
					</NumberComponent>
				))}
			+
			<NumberComponent isSymbol className={symbolClassName}>
				<SymbolElement symbol={line.symbol} />
			</NumberComponent>
		</div>
	);
}

export default SharedLine;
