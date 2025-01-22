import { NumberComponent, SymbolElement } from '@/src/components/Line.tsx';
import type { ILine } from '@/src/lib/types.ts';

function Line({ line }: { line: ILine }) {
	return (
		<div className={'flex gap-2 items-center'}>
			{line.numbers
				.sort((a, b) => a - b)
				.map((number, index) => (
					<NumberComponent key={index}>{number || '-'}</NumberComponent>
				))}
			+
			<NumberComponent isSymbol>
				<SymbolElement symbol={line.symbol} />
			</NumberComponent>
		</div>
	);
}

export default Line;
