import type { FC } from 'react';

interface StatBoxProps {
	label: string;
	value: React.ReactNode;
	icon?: React.ReactNode;
}

export const StatBox: FC<StatBoxProps> = ({ label, value, icon }) => (
	<div className="bg-secondary text-secondary-foreground rounded-xl flex items-center justify-between p-4 py-2 flex-col">
		<span className="text-muted-foreground text-sm">{label}</span>
		<div className="flex flex-row items-center gap-1">
			{value} {icon}
		</div>
	</div>
);
