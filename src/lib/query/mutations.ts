import { buyTicket, manualRequest, unlockMultibet } from '@/src/lib/api';
import type { ITicket } from '@/src/lib/types.ts';
import { toast } from '@betfinio/components/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { getTransactionLink } from 'betfinio_context/lib/helpers';
import { useTranslation } from 'react-i18next';
import type { Address, WriteContractErrorType, WriteContractReturnType } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useConfig } from 'wagmi';
import { useMutation } from 'wagmi/query';

interface BuyTicketProps {
	lines: ITicket[];
	rounds: Address[];
	recipient: Address;
}

export const useUnlockMultibet = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.unlockMultibet' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType>({
		mutationKey: ['lottery', 'unlockMultibet'],
		mutationFn: () => unlockMultibet(config),
		onError: (error) => console.log(error),
		onSuccess: async (data) => {
			if (data !== undefined) {
				const { id, update } = toast({
					title: t('sent.title'),
					description: t('sent.description'),
					variant: 'loading',
					duration: 60 * 1000,
				});
				await waitForTransactionReceipt(config.getClient(), {
					hash: data,
				});
				await queryClient.invalidateQueries({ queryKey: ['lottery', 'allowance'] });
				update({
					title: t('sent.title'),
					description: t('sent.description'),
					variant: 'default',
					duration: 5 * 1000,
					id: id,
					action: getTransactionLink(data),
				});
			} else {
				toast({
					title: 'Error',
					variant: 'destructive',
				});
			}
		},
	});
};

export const useBuyTicket = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.buyTicket' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType, BuyTicketProps>({
		mutationKey: ['lottery', 'buyTicket'],
		mutationFn: (params) => buyTicket(params, config),
		onError: (error) => console.log(error),
		onSuccess: async (data) => {
			if (data !== undefined) {
				const { id, update } = toast({
					title: t('sent.title'),
					description: t('sent.description'),
					variant: 'loading',
					duration: 60 * 1000,
				});
				await waitForTransactionReceipt(config.getClient(), {
					hash: data,
				});
				await queryClient.invalidateQueries({ queryKey: ['lottery', 'round'] });
				update({
					title: t('sent.title'),
					description: t('sent.description'),
					variant: 'default',
					duration: 5 * 1000,
					id: id,
					action: getTransactionLink(data),
				});
			} else {
				toast({
					title: errors('unknown'),
					variant: 'destructive',
				});
			}
		},
	});
};

export const useManualRequest = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.manualRequest' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType, { round: Address }>({
		mutationKey: ['lottery', 'manualRequest'],
		mutationFn: ({ round }) => manualRequest(round, config),
		onError: (error) => console.log(error),
		onSuccess: async (data) => {
			if (data !== undefined) {
				const { id, update } = toast({
					title: t('sent.title'),
					description: t('sent.description'),
					variant: 'loading',
					duration: 60 * 1000,
				});
				await waitForTransactionReceipt(config.getClient(), {
					hash: data,
				});
				await queryClient.invalidateQueries({ queryKey: ['lottery', 'round'] });
				update({
					title: 'Requested',
					variant: 'default',
					duration: 5 * 1000,
					id: id,
					action: getTransactionLink(data),
				});
			} else {
				toast({
					title: 'Error',
					variant: 'destructive',
				});
			}
		},
	});
};
