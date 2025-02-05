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
