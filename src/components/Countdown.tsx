import { type TimeDiff, getDiff } from '@/src/lib/utils';
import { cn } from '@betfinio/components';
import { useEffect, useRef, useState } from 'react';

export interface CountdownProps {
	finish: number;
	size?: number;
	className?: string;
	onFinish?: () => void;
}
function Countdown({ finish, size = 40, className = '', onFinish }: CountdownProps) {
	const [diff, setDiff] = useState<TimeDiff>({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});
	const [isFinished, setIsFinished] = useState(false);
	const hasFinishedRef = useRef(false);

	const updateDiff = () => {
		const now = Math.floor(Date.now() / 1000);
		if (now >= finish) {
			if (!hasFinishedRef.current) {
				setIsFinished(true);
				hasFinishedRef.current = true;
				if (onFinish) onFinish();
			}
			return;
		}
		const newDiff = getDiff(now, finish);
		setDiff(newDiff);
	};

	useEffect(() => {
		const now = Math.floor(Date.now() / 1000);

		if (finish < now) {
			if (!hasFinishedRef.current) {
				setIsFinished(true);
				hasFinishedRef.current = true;
				if (onFinish) onFinish();
			}
			return;
		}

		updateDiff();
		const interval = setInterval(() => {
			updateDiff();
		}, 1000);

		return () => clearInterval(interval);
	}, [finish, onFinish]);

	if (isFinished) {
		return (
			<div className={cn('flex flex-row items-center justify-center text-foreground text-sm gap-1', className)}>
				<div style={{ width: `${size}px` }} className={'aspect-square rounded-lg bg-secondary flex items-center justify-center'}>
					0d
				</div>
				:
				<div style={{ width: `${size}px` }} className={'aspect-square rounded-lg bg-secondary flex items-center justify-center'}>
					0h
				</div>{' '}
				:
				<div style={{ width: `${size}px` }} className={'aspect-square rounded-lg bg-secondary flex items-center justify-center'}>
					0m
				</div>{' '}
				:
				<div style={{ width: `${size}px` }} className={'aspect-square rounded-lg bg-secondary flex items-center justify-center'}>
					0s
				</div>
			</div>
		);
	}

	return (
		<div className={cn('flex flex-row items-center justify-center text-foreground text-sm gap-1', className)}>
			<div style={{ width: `${size}px` }} className={'aspect-square rounded-lg bg-secondary flex items-center justify-center'}>
				{diff.days}d
			</div>
			:
			<div style={{ width: `${size}px` }} className={'aspect-square rounded-lg bg-secondary flex items-center justify-center'}>
				{diff.hours}h
			</div>{' '}
			:
			<div style={{ width: `${size}px` }} className={'aspect-square rounded-lg bg-secondary flex items-center justify-center'}>
				{diff.minutes}m
			</div>{' '}
			:
			<div style={{ width: `${size}px` }} className={'aspect-square rounded-lg bg-secondary flex items-center justify-center'}>
				{diff.seconds}s
			</div>
		</div>
	);
}

export default Countdown;
