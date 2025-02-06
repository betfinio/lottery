import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { Address } from 'viem';
import { RoundState } from '../types';

// use query that saves state of round

export interface IUseRoundState {
	state: RoundState;
	updateState: (state: RoundState) => void;
}

export const useRoundState = (address: Address): IUseRoundState => {
	const queryClient = useQueryClient();

	const query = useQuery<RoundState>({
		queryKey: ['state', 'round', address],
		initialData: RoundState.FILLING,
	});

	const updateState = (state: RoundState) => {
		queryClient.setQueryData(['state', 'round', address], state);
	};

	return {
		state: query.data,
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
