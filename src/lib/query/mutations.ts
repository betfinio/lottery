import {
	buyTicket,
	claimTicket,
	getMintedTokensByHash,
	manualDistributeJackpot,
	manualDistributeRefund,
	manualRefund,
	manualRequest,
	sendTicket,
	unlockEdit,
	unlockMultibet,
	updateTicket,
} from '@/src/lib/api';
import type { ILine, IRoundTicket } from '@/src/lib/types.ts';
import { ZeroAddress } from '@betfinio/abi';
import { toast } from '@betfinio/components/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { getTransactionLink } from 'betfinio_context/lib/helpers';
import { useTranslation } from 'react-i18next';
import type { Address, Log, WriteContractErrorType, WriteContractReturnType } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useConfig } from 'wagmi';
import { useMutation } from 'wagmi/query';

export interface BuyTicketProps {
	lines: ILine[];
	rounds: Address[];
	recipient: Address;
}

export const useUnlockMultibet = () => {
	const { t } = useTranslation('lottery');
	useTranslation('shared', { keyPrefix: 'errors' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType>({
		mutationKey: ['lottery', 'unlockMultibet'],
		mutationFn: () => unlockMultibet(config),
		onSuccess: async (data) => {
			if (data !== undefined) {
				const { id, update } = toast({
					title: t('transactionPending'),

					variant: 'loading',
					duration: 60 * 1000,
				});
				await waitForTransactionReceipt(config.getClient(), {
					hash: data,
				});
				await queryClient.invalidateQueries({ queryKey: ['lottery', 'allowance'] });
				update({
					title: t('transactionSubmitted'),

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

export const useUnlockEdit = () => {
	const { t } = useTranslation('lottery');

	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType>({
		mutationKey: ['lottery', 'unlockEdit'],
		mutationFn: () => unlockEdit(config),
		onSuccess: async (data) => {
			if (data !== undefined) {
				const { id, update } = toast({
					title: t('transactionPending'),

					variant: 'loading',
					duration: 60 * 1000,
				});
				await waitForTransactionReceipt(config.getClient(), {
					hash: data,
				});
				await queryClient.invalidateQueries({ queryKey: ['lottery', 'allowance'] });
				update({
					title: t('transactionSubmitted'),

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

interface UpdateTicketProps {
	ticket: IRoundTicket;
}

export const useUpdateTicket = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
	const queryClient = useQueryClient();
	const config = useConfig();
	return useMutation<WriteContractReturnType, WriteContractErrorType, UpdateTicketProps>({
		mutationKey: ['lottery', 'updateTicket'],
		mutationFn: ({ ticket }) => updateTicket(ticket, config),
		onError: (error) => {
			// @ts-ignore
			if (error.cause?.reason) {
				toast({
					title: t('errors.title'),
					// @ts-ignore
					description: t(`errors.${error.cause.reason}`, { defaultValue: errors(error.cause.reason) }),
					variant: 'destructive',
				});
			}
		},
		onSuccess: async (data) => {
			if (data !== undefined) {
				const { id, update } = toast({
					title: t('editTicket.sent.title'),
					description: t('editTicket.sent.description'),
					variant: 'loading',
					duration: 60 * 1000,
				});
				await waitForTransactionReceipt(config.getClient(), {
					hash: data,
				});
				await queryClient.invalidateQueries({ queryKey: ['lottery', 'round'] });
				await queryClient.invalidateQueries({ queryKey: ['lottery', 'tickets', 'all'] });
				update({
					title: t('editTicket.sent.title'),
					description: t('editTicket.sent.description'),
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

export const useBuyTicket = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType, BuyTicketProps>({
		mutationKey: ['lottery', 'buyTicket'],
		mutationFn: (params) => buyTicket(params, config),
		onError: (error) => {
			console.log(error);
			// @ts-ignore
			if (error.cause?.reason) {
				toast({
					title: t('errors.title'),
					// @ts-ignore
					description: t(`errors.${error.cause.reason}`, { defaultValue: errors(error.cause.reason) }),
					variant: 'destructive',
				});
			}
		},
		onSuccess: async (data) => {
			if (data !== undefined) {
				const { id, update } = toast({
					title: t('buyTicket.sent.title'),
					description: t('buyTicket.sent.description'),
					variant: 'loading',
					duration: 60 * 1000,
				});
				await waitForTransactionReceipt(config.getClient(), {
					hash: data,
				});
				// update table key
				queryClient.invalidateQueries({ queryKey: ['lottery', 'round'] });
				update({
					title: t('buyTicket.sent.title'),
					description: t('buyTicket.sent.description'),
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

export const useSendTicket = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.sendTicket' });
	const queryClient = useQueryClient();
	const config = useConfig();
	const { address: sender = ZeroAddress } = useAccount();

	return useMutation<WriteContractReturnType, WriteContractErrorType, { ticket: bigint; recipient: Address }>({
		mutationKey: ['lottery', 'sendTicket'],
		mutationFn: ({ ticket, recipient }) => sendTicket(ticket, sender, recipient, config),
		onError: (error) => {
			console.log(error);
		},
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
				await queryClient.invalidateQueries({ queryKey: ['lottery', 'tickets'] });
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

export const useManualRequest = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.manualRequest' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType, { round: Address }>({
		mutationKey: ['lottery', 'manualRequest'],
		mutationFn: ({ round }) => manualRequest(round, config),
		onError: (error) => {
			console.log(error);
		},
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

export const useManualRefund = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.manualRefund' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, never, { round: Address }>({
		mutationKey: ['lottery', 'manualRefund'],
		mutationFn: ({ round }) => manualRefund(round, config),
		onError: (error) => {
			console.log(error);
		},
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
					title: 'Refunded',
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

export const useManualDistributeRefund = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.manualDistributeRefund' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, WriteContractErrorType, { round: Address }>({
		mutationKey: ['lottery', 'manualDistributeRefund'],
		mutationFn: ({ round }) => manualDistributeRefund(round, config),
		onError: (error) => {
			console.log(error);
		},
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
					title: 'Distributed',
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

export const useManualDistributeJackpot = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.manualDistributeJackpot' });
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<WriteContractReturnType, never, { round: Address }>({
		mutationKey: ['lottery', 'manualDistributeJackpot'],
		mutationFn: ({ round }) => manualDistributeJackpot(round, config),
		onError: (error) => {
			console.log(error);
		},
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
					title: 'Distributed',
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

export const useClaimTicket = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.claimTicket' });
	const queryClient = useQueryClient();
	const config = useConfig();
	return useMutation<WriteContractReturnType, WriteContractErrorType, { ticket: Address }>({
		mutationKey: ['lottery', 'claimTicket'],
		mutationFn: ({ ticket }) => claimTicket(ticket, config),
		onError: (error) => {
			console.log(error);
		},
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
				await queryClient.invalidateQueries({ queryKey: ['lottery'] });
				update({
					title: 'Distributed',
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

export const useLoadMintedTokens = () => {
	const config = useConfig();
	const queryClient = useQueryClient();
	return useMutation<IRoundTicket[], never, { hash: Address }>({
		mutationKey: ['lottery', 'ticketsByHash'],
		mutationFn: ({ hash }) => getMintedTokensByHash(hash, config),
	});
};
