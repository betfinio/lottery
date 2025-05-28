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
		return [...winningLine.numbers, winningLine.symbol]; // Assuming numbers is an array in the winningLine object
	}, [winningLine]);

	// State to track currently revealed numbers
	const [revealedNumbers, setRevealedNumbers] = useState<number[]>([]);

	useEffect(() => {
		// Reset revealed numbers when winning line changes
		setRevealedNumbers([]);

		// If we don't have the finished timestamp or winning numbers yet, exit early
		if (!finishedTimeStamp || winningNumbers.length === 0) return;

		// Calculate the intervals to distribute numbers evenly across the entire gap
		// We have (totalNumbers) intervals to cover, from 0 to revealGap
		const totalNumbers = winningNumbers.length;

		// If there's only 1 number, show it immediately
		if (totalNumbers === 1) {
			setRevealedNumbers(winningNumbers);
			return;
		}

		// Calculate interval duration to spread numbers evenly with the last one at exactly revealGap
		// For N numbers, we need N-1 intervals that span the entire reveal gap
		const intervalDuration = revealGap / (totalNumbers - 1);

		// Get current time and calculate elapsed time since round finished
		const now = Math.floor(Date.now() / 1000);
		const elapsedTime = now - finishedTimeStamp;

		// If the reveal period is over, show all numbers immediately
		if (elapsedTime >= revealGap) {
			setRevealedNumbers([...winningNumbers]);
			return;
		}

		// Calculate how many numbers should be visible now based on elapsed time
		// We use Math.floor(elapsedTime / intervalDuration) to get fully completed intervals
		// Add 1 to show the number at the beginning (0th second)
		const numbersToShow = Math.min(Math.floor(elapsedTime / intervalDuration) + 1, totalNumbers);

		// Immediately show the numbers that should be visible by now
		setRevealedNumbers(winningNumbers.slice(0, numbersToShow));

		// Set up intervals for revealing the remaining numbers
		const timers: NodeJS.Timeout[] = [];

		for (let i = numbersToShow; i < totalNumbers; i++) {
			// Calculate when this number should appear
			// For index i, the reveal time is i * intervalDuration seconds after the round finish
			const revealTime = finishedTimeStamp + i * intervalDuration;
			const delay = (revealTime - now) * 1000; // Convert to milliseconds

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
		isComplete: revealedNumbers.length === winningNumbers.length && winningNumbers.length > 0,
		isLoading: isFetching || !finishedTimeStamp,
		finishedTimeStamp,
	};
};
