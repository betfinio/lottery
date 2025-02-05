import { cn } from '@betfinio/components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactNode, useState } from 'react';

interface PaginationProps<T> {
	items: T[];
	itemsPerPage?: number;
	renderItem: (item: T, index: number) => ReactNode;
	className?: string;
	additionalFooter?: ReactNode;
}

const Pagination = <T,>({ items, itemsPerPage = 3, renderItem, className, additionalFooter }: PaginationProps<T>) => {
	const [offset, setOffset] = useState(0);

	const handleNext = () => {
		if (offset + itemsPerPage >= items.length) return;
		setOffset((prev) => prev + itemsPerPage);
	};

	const handlePrev = () => {
		if (offset === 0) return;
		setOffset((prev) => prev - itemsPerPage);
	};

	return (
		<div className={cn('flex flex-col justify-between h-full', className)}>
			<div className={'flex flex-col gap-2 flex-grow'}>{items.slice(offset, offset + itemsPerPage).map((item, index) => renderItem(item, index + offset))}</div>
			<div className={'flex flex-row justify-between py-2 items-center h-10'}>
				{additionalFooter}
				<ChevronLeft className={cn('w-5 h-5 cursor-pointer', offset === 0 && 'text-muted-foreground')} onClick={handlePrev} />
				<div className={'flex flex-row gap-1'}>
					{Array.from({ length: Math.ceil(items.length / itemsPerPage) }).map((_, i) => (
						<div
							key={i}
							className={cn(
								'rounded-md w-6 h-6 flex items-center justify-center text-sm',
								i === Math.floor(offset / itemsPerPage) ? 'text-foreground' : 'text-muted-foreground',
							)}
						>
							{i + 1}
						</div>
					))}
				</div>
				<ChevronRight className={cn('w-5 h-5 cursor-pointer', offset + itemsPerPage >= items.length && 'text-muted-foreground')} onClick={handleNext} />
			</div>
		</div>
	);
};

export default Pagination;
