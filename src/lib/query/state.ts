import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type DrawTab, RoundState, type TicketsTab } from '../types';
import { useWinningLine } from '.';

export const useLocalStorage = <T>(key: string, options: { defaultValue?: T } = {}) => {
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
		queryClient.setQueryData(['drawInfoTab'], tab);
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
	const query = useQuery<string[]>({
		queryKey: ['highlightedTickets'],
		initialData: [],
	});

	const setHighlightedTickets = (tickets: string[]) => {
		queryClient.setQueryData(['highlightedTickets'], tickets);
	};

	return {
		highlightedTickets: query.data,
		setHighlightedTickets,
	};
};

/** UI state for managing the ticket creation flow (filling lines vs placing bet). Keyed by roundId. */
export const useRoundState = (roundId?: bigint) => {
	const queryClient = useQueryClient();
	const key = ['roundState', roundId?.toString() ?? 'none'];
	const query = useQuery<RoundState>({
		queryKey: key,
		initialData: RoundState.FILLING,
	});

	const updateState = useCallback(
		(state: RoundState) => {
			queryClient.setQueryData(key, state);
		},
		[queryClient, roundId],
	);

	return {
		state: query.data ?? RoundState.FILLING,
		updateState,
	};
};

export const useRoundFinishedNumbersSpitting = (roundId: bigint) => {
	const { data: winningLine, isFetching } = useWinningLine(roundId);

	const winningNumbers = useMemo(() => {
		if (!winningLine) return [];
		return [...winningLine.numbers, winningLine.symbol];
	}, [winningLine]);

	const [revealedNumbers, setRevealedNumbers] = useState<number[]>([]);

	useEffect(() => {
		setRevealedNumbers([]);

		if (winningNumbers.length === 0) return;

		// Reveal all numbers progressively over 5 seconds
		const totalNumbers = winningNumbers.length;
		const intervalDuration = 5 / (totalNumbers - 1 || 1);

		const timers: ReturnType<typeof setTimeout>[] = [];
		for (let i = 0; i < totalNumbers; i++) {
			const timer = setTimeout(
				() => {
					setRevealedNumbers((prev) => [...prev, winningNumbers[i]]);
				},
				i * intervalDuration * 1000,
			);
			timers.push(timer);
		}

		return () => {
			for (const timer of timers) {
				clearTimeout(timer);
			}
		};
	}, [winningNumbers]);

	return {
		revealedNumbers,
		allNumbers: winningNumbers,
		isComplete: revealedNumbers.length === winningNumbers.length && winningNumbers.length > 0,
		isLoading: isFetching,
	};
};
