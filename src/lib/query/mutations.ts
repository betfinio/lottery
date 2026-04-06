import { toast } from '@betfinio/components/ui';
import { useQueryClient } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import { getTransactionLink } from 'betfinio_context/lib/helpers';
import { useTranslation } from 'react-i18next';
import type { Address, WriteContractErrorType, WriteContractReturnType } from 'viem';
import { useAccount, useConfig } from 'wagmi';
import { useMutation } from 'wagmi/query';
import { placeBet, cancelRound, claimBatchBets, claimBet, refundBatch, settleRound, spinRound } from '@/src/lib/api';
import type { ITicket } from '@/src/lib/types';

export interface PlaceBetProps {
	tickets: ITicket[];
	roundIds: bigint[];
	recipient: Address;
}

export const usePlaceBet = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
	const config = useConfig();
	return useMutation<Address | undefined, WriteContractErrorType, PlaceBetProps>({
		mutationKey: ['lottery', 'placeBet'],
		mutationFn: (params) => placeBet(params, config),
		onError: (error) => {
			console.log(error);
			// @ts-expect-error
			if (error.cause?.reason) {
				toast.error(t('errors.title'), {
					// @ts-expect-error
					description: t(`errors.${error.cause.reason}`, { defaultValue: errors(error.cause.reason) }),
				});
			}
		},
		onSuccess: async (data) => {
			if (data !== undefined) {
				toast.success(t('buyTicket.sent.description'), {
					action: getTransactionLink(data),
				});
			} else {
				toast.error(errors('unknown'));
			}
		},
	});
};

export const useClaimBet = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.claimTicket' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
	const queryClient = useQueryClient();
	const config = useConfig();
	return useMutation<WriteContractReturnType, WriteContractErrorType, { betAddress: Address }>({
		mutationKey: ['lottery', 'claimBet'],
		mutationFn: ({ betAddress }) => claimBet(betAddress, config),
		onSuccess: async (data) => {
			if (data !== undefined) {
				const promise = async () => {
					await waitForTransactionReceipt(config, { hash: data });
					await queryClient.invalidateQueries({ queryKey: ['lottery'] });
				};
				await toast.promise(promise, {
					loading: t('sent.title'),
					success: t('sent.description'),
					error: errors('unknown'),
					action: getTransactionLink(data),
				});
			}
		},
	});
};

export const useClaimBatchBets = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.claimTicket' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
	const queryClient = useQueryClient();
	const config = useConfig();
	return useMutation<WriteContractReturnType, WriteContractErrorType, { betAddresses: Address[] }>({
		mutationKey: ['lottery', 'claimBatchBets'],
		mutationFn: ({ betAddresses }) => claimBatchBets(betAddresses, config),
		onSuccess: async (data) => {
			if (data !== undefined) {
				const promise = async () => {
					await waitForTransactionReceipt(config, { hash: data });
					await queryClient.invalidateQueries({ queryKey: ['lottery'] });
				};
				await toast.promise(promise, {
					loading: t('sent.title'),
					success: t('sent.description'),
					error: errors('unknown'),
					action: getTransactionLink(data),
				});
			}
		},
	});
};

export const useSpinRound = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.manualRequest' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType, { roundId: bigint }>({
		mutationKey: ['lottery', 'spinRound'],
		mutationFn: ({ roundId }) => spinRound(roundId, config),
		onSuccess: async (data) => {
			if (data !== undefined) {
				const promise = async () => {
					await waitForTransactionReceipt(config, { hash: data });
					await queryClient.invalidateQueries({ queryKey: ['lottery'] });
				};
				await toast.promise(promise, {
					loading: t('sent.title'),
					success: t('sent.description'),
					error: errors('unknown'),
				});
			}
		},
	});
};

export const useSettleRound = () => {
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType, { roundId: bigint }>({
		mutationKey: ['lottery', 'settleRound'],
		mutationFn: ({ roundId }) => settleRound(roundId, config),
		onSuccess: async (data) => {
			if (data !== undefined) {
				const promise = async () => {
					await waitForTransactionReceipt(config, { hash: data });
					await queryClient.invalidateQueries({ queryKey: ['lottery'] });
				};
				await toast.promise(promise, {
					loading: 'Settling round...',
					success: 'Round settled',
					error: errors('unknown'),
				});
			}
		},
	});
};

export const useCancelRound = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.manualRefund' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType, { roundId: bigint }>({
		mutationKey: ['lottery', 'cancelRound'],
		mutationFn: ({ roundId }) => cancelRound(roundId, config),
		onSuccess: async (data) => {
			if (data !== undefined) {
				const promise = async () => {
					await waitForTransactionReceipt(config, { hash: data });
					await queryClient.invalidateQueries({ queryKey: ['lottery'] });
				};
				await toast.promise(promise, {
					loading: t('sent.title'),
					success: t('sent.description'),
					error: errors('unknown'),
				});
			}
		},
	});
};

export const useRefundBatch = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.manualDistributeRefund' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType, { betAddresses: Address[] }>({
		mutationKey: ['lottery', 'refundBatch'],
		mutationFn: ({ betAddresses }) => refundBatch(betAddresses, config),
		onSuccess: async (data) => {
			if (data !== undefined) {
				const promise = async () => {
					await waitForTransactionReceipt(config, { hash: data });
					await queryClient.invalidateQueries({ queryKey: ['lottery'] });
				};
				await toast.promise(promise, {
					loading: t('sent.title'),
					success: t('sent.description'),
					error: errors('unknown'),
				});
			}
		},
	});
};
