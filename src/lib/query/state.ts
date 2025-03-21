import { ROUND_REVEAL_AFTER_GENERATION_DELAY_GAP } from '@/src/globals';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Address } from 'viem';
import { useRoundFinishedTimeStamp, useWinningLine } from '.';
import { type DrawTab, RoundState, type TicketsTab } from '../types';

// use query that saves state of round

export interface IUseRoundState {
	state: RoundState;
	updateState: (state: RoundState) => void;
}

export const useRoundState = (address?: Address): IUseRoundState => {
	const queryClient = useQueryClient();

	const query = useQuery<RoundState>({
		queryKey: ['state', 'round', address],
		initialData: RoundState.FILLING,
	});

	const updateState = (state: RoundState) => {
		queryClient.setQueryData(['state', 'round', address], state);
	};

	return {
		state: query.data ?? RoundState.FILLING,
		updateState,
	};
};

interface UseLocalStorageOptions<T> {
	defaultValue?: T;
}

export const useLocalStorage = <T>(key: string, options: UseLocalStorageOptions<T> = {}) => {
	const queryClient = useQueryClient();

	const fetchValue = useCallback(() => {
		try {
			const value = localStorage.getItem(key);
			return (value ? JSON.parse(value) : (options.defaultValue ?? false)) as T;
		} catch (error) {
			console.error(`Error reading from localStorage key "${key}":`, error);
			return options.defaultValue as T;
		}
	}, [key, options.defaultValue]);

	const query = useQuery<T>({
		queryKey: ['localstorage', key],
		queryFn: fetchValue,
	});

	const setValue = useCallback(
		(value: T) => {
			try {
				localStorage.setItem(key, JSON.stringify(value));
				queryClient.invalidateQueries({ queryKey: ['localstorage', key] });
			} catch (error) {
				console.error(`Error writing to localStorage key "${key}":`, error);
			}
		},
		[key, queryClient],
	);

	return {
		value: query.data as T,
		setValue,
	};
};

export const useDrawInfoTab = () => {
	const queryClient = useQueryClient();
	const query = useQuery<DrawTab>({
		queryKey: ['drawInfoTab'],
		initialData: 'draw',
	});

	const setTab = (tab: DrawTab) => {
		if (tab === 'draw' || tab === 'active' || tab === 'old' || tab === 'bonus') {
			queryClient.setQueryData(['drawInfoTab'], tab);
		}
	};

	return {
		tab: query.data,
		setTab,
	};
};

export const useTicketsTab = () => {
	const queryClient = useQueryClient();
	const query = useQuery<TicketsTab>({
		queryKey: ['ticketsTab'],
		initialData: 'active',
	});

	const setTab = (tab: string) => {
		if (tab === 'active' || tab === 'old') {
			queryClient.setQueryData(['ticketsTab'], tab);
		}
	};

	return {
		tab: query.data,
		setTab,
	};
};

export const useHighlightedTickets = () => {
	const queryClient = useQueryClient();
	const query = useQuery<number[]>({
		queryKey: ['highlightedTickets'],
		initialData: [],
	});

	const setHighlightedTickets = (tickets: number[]) => {
		queryClient.setQueryData(['highlightedTickets'], tickets);
	};

	return {
		highlightedTickets: query.data,
		setHighlightedTickets,
	};
};

export const useRoundFinishedNumbersSpitting = (round: Address) => {
	const { data: finishedTimeStamp } = useRoundFinishedTimeStamp(round);
	const { data: winningLine, isFetching } = useWinningLine(round);
	const revealGap = ROUND_REVEAL_AFTER_GENERATION_DELAY_GAP; // 30 seconds

	// Extract the winning numbers from the winningLine if available
	const winningNumbers = useMemo(() => {
		if (!winningLine) return [];
		return winningLine.numbers; // Assuming numbers is an array in the winningLine object
	}, [winningLine]);

	// State to track currently revealed numbers
	const [revealedNumbers, setRevealedNumbers] = useState<number[]>([]);

	useEffect(() => {
		// Reset revealed numbers when winning line changes
		setRevealedNumbers([]);

		// If we don't have the finished timestamp or winning numbers yet, exit early
		if (!finishedTimeStamp || winningNumbers.length === 0) return;

		// Calculate the number of intervals and the interval duration
		const totalNumbers = winningNumbers.length;
		const intervalDuration = revealGap / totalNumbers;

		// Get current time and calculate elapsed time since round finished
		const now = Math.floor(Date.now() / 1000);
		const elapsedTime = now - finishedTimeStamp;

		// If the reveal period is over, show all numbers immediately
		if (elapsedTime >= revealGap) {
			setRevealedNumbers([...winningNumbers]);
			return;
		}

		// Calculate how many numbers should be visible now based on elapsed time
		const numbersToShow = Math.min(Math.floor(elapsedTime / intervalDuration) + 1, totalNumbers);

		// Immediately show the numbers that should be visible by now
		setRevealedNumbers(winningNumbers.slice(0, numbersToShow));

		// Set up intervals for revealing the remaining numbers
		const timers: NodeJS.Timeout[] = [];

		for (let i = numbersToShow; i < totalNumbers; i++) {
			const delay = i * intervalDuration * 1000 - elapsedTime * 1000;
			const timer = setTimeout(() => {
				setRevealedNumbers((prev) => [...prev, winningNumbers[i]]);
			}, delay) as unknown as NodeJS.Timeout;
			timers.push(timer);
		}

		// Cleanup timers on unmount or when dependencies change
		return () => {
			for (const timer of timers) {
				clearTimeout(timer);
			}
		};
	}, [finishedTimeStamp, winningNumbers, revealGap]);

	return {
		revealedNumbers,
		allNumbers: winningNumbers,
		isComplete: revealedNumbers.length === winningNumbers.length,
		isLoading: isFetching || !finishedTimeStamp,
		finishedTimeStamp,
	};
};
