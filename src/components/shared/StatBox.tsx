import { cn } from '@betfinio/components';
import type { FC } from 'react';

interface StatBoxProps {
	label: string;
	value: React.ReactNode;
	icon?: React.ReactNode;
	isLoading?: boolean;
	className?: string;
}

export const StatBox: FC<StatBoxProps> = ({ label, value, icon, isLoading, className }) => (
	<div className={cn('bg-secondary text-secondary-foreground rounded-xl flex items-center justify-between p-4 py-2 flex-col', className)}>
		<span className="text-muted-foreground text-sm">{label}</span>
		<div className="flex flex-row items-center gap-1">
			<div className={cn({ 'animate-pulse blur': isLoading })}>{value}</div> {icon}
		</div>
	</div>
);
