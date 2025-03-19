import { cn } from '@betfinio/components';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

interface PaginationProps<T> {
	items: T[];
	itemsPerPage?: number;
	renderItem: (item: T, index: number, ticketInPage: T[]) => ReactNode;
	className?: string;
	additionalFooter?: ReactNode;
	renderItemClassName?: string | ((item: T, index: number, ticketInPage: T[]) => string);
	onPageChange?: (page: number) => void;
	isLive?: boolean;
}

const Pagination = <T,>({ items, itemsPerPage = 3, renderItem, className, additionalFooter, onPageChange, isLive = false }: PaginationProps<T>) => {
	const [offset, setOffset] = useState(0);
	const [length, setLength] = useState(0);

	useEffect(() => {
		if (onPageChange) {
			onPageChange(offset / itemsPerPage);
		}
	}, [offset]);

	// navigate to correct page one item is added
	useEffect(() => {
		if (items.length > 0 && isLive && length !== items.length) {
			const newOffset = Math.floor((items.length - 1) / itemsPerPage) * itemsPerPage;
			setOffset(newOffset);
		}
		setLength(items.length);
	}, [items, isLive]);

	const handleNext = () => {
		if (offset + itemsPerPage >= items.length) return;
		setOffset((prev) => prev + itemsPerPage);
	};

	const handlePrev = () => {
		if (offset === 0) return;
		setOffset((prev) => prev - itemsPerPage);
	};

	const currentPage = Math.floor(offset / itemsPerPage);
	const totalPages = Math.ceil(items.length / itemsPerPage);

	const renderPageNumbers = () => {
		const pages = [];
		if (totalPages <= 6) {
			for (let i = 0; i < totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 2) {
				pages.push(0, 1, 2, 3, -1, totalPages - 1);
			} else if (currentPage >= totalPages - 3) {
				pages.push(0, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
			} else {
				pages.push(0, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages - 1);
			}
		}
		return pages;
	};

	return (
		<AnimatePresence mode="sync">
			<motion.div className={cn('h-full', className)}>
				{items.slice(offset, offset + itemsPerPage).map((item, index) => renderItem(item, index + offset, items.slice(offset, offset + itemsPerPage)))}
				<div className={'flex flex-row justify-between py-2 items-end row-span-1 row-start-13 flex-grow'}>
					{additionalFooter}
					<ChevronLeft className={cn('w-5 h-5 cursor-pointer', offset === 0 && 'text-muted-foreground')} onClick={handlePrev} />
					<div className={'flex flex-row gap-1 justify-end'}>
						{renderPageNumbers().map((pageIndex, i) =>
							pageIndex === -1 ? (
								<div key={`ellipsis-${i}`} className="w-6 h-6 flex items-center justify-center text-sm text-muted-foreground">
									...
								</div>
							) : (
								<div
									onClick={() => setOffset(pageIndex * itemsPerPage)}
									key={pageIndex}
									className={cn(
										'rounded-md w-6 h-6 flex items-center justify-center text-sm cursor-pointer',
										pageIndex === currentPage ? 'text-foreground' : 'text-muted-foreground',
									)}
								>
									{pageIndex + 1}
								</div>
							),
						)}
					</div>
					<ChevronRight className={cn('w-5 h-5 cursor-pointer', offset + itemsPerPage >= items.length && 'text-muted-foreground')} onClick={handleNext} />
				</div>
			</motion.div>
		</AnimatePresence>
	);
};

export default Pagination;
