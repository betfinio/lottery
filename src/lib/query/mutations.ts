import { ZeroAddress } from '@betfinio/abi';
import { toast } from '@betfinio/components/ui';
import { useQueryClient } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import { getTransactionLink } from 'betfinio_context/lib/helpers';
import { useTranslation } from 'react-i18next';
import type { Address, WriteContractErrorType, WriteContractReturnType } from 'viem';
import { useAccount, useConfig } from 'wagmi';
import { useMutation } from 'wagmi/query';
import {
	buyTicket,
	claimTicket,
	claimUnclaimedTickets,
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
				toast.promise(
					async () => {
						await waitForTransactionReceipt(config, {
							hash: data,
						});
						await queryClient.invalidateQueries({ queryKey: ['lottery', 'allowance'] });
						return data;
					},
					{
						loading: t('transactionPending'),
						success: t('transactionSubmitted'),
						action: getTransactionLink(data),
						error: 'Error processing transaction',
					},
				);
			} else {
				toast.error('Error');
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
				toast.promise(
					async () => {
						await waitForTransactionReceipt(config, {
							hash: data,
						});
						await queryClient.invalidateQueries({ queryKey: ['lottery', 'allowance'] });
						return data;
					},
					{
						loading: t('transactionPending'),
						success: t('transactionSubmitted'),
						action: getTransactionLink(data),
						error: 'Error processing transaction',
					},
				);
			} else {
				toast.error('Error');
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
			// @ts-expect-error
			if (error.cause?.reason) {
				toast.error(t('errors.title'), {
					// @ts-expect-error
					description: t(`errors.${error.cause.reason}`, { defaultValue: errors(error.cause.reason) }),
				});
			}
		},
		onSuccess: async (data) => {
			console.log('data', data);
			if (data !== undefined) {
				return new Promise<void>((resolve) => {
					const promise = async () => {
						await waitForTransactionReceipt(config, {
							hash: data,
						});
						await queryClient.invalidateQueries({ queryKey: ['lottery', 'round'] });
						await queryClient.invalidateQueries({ queryKey: ['lottery', 'tickets', 'all'] });
						resolve();
					};
					toast.promise(promise, {
						loading: t('editTicket.sent.title'),
						success: t('editTicket.sent.description'),
						error: errors('unknown'),
						action: getTransactionLink(data),
					});
				});
			}
		},
	});
};

export const useBuyTicket = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
	const config = useConfig();
	return useMutation<WriteContractReturnType, WriteContractErrorType, BuyTicketProps>({
		mutationKey: ['lottery', 'buyTicket'],
		mutationFn: (params) => buyTicket(params, config),
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
				toast.promise(
					async () => {
						await waitForTransactionReceipt(config, {
							hash: data,
						});
					},
					{
						loading: t('buyTicket.sent.title'),
						success: t('buyTicket.sent.description'),
						error: errors('unknown'),
						action: getTransactionLink(data),
					},
				);
			} else {
				toast.error(errors('unknown'));
			}
		},
	});
};

export const useSendTicket = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.sendTicket' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
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
				const promise = async () => {
					await waitForTransactionReceipt(config, {
						hash: data,
					});
					await queryClient.invalidateQueries({ queryKey: ['lottery', 'round'] });
					await queryClient.invalidateQueries({ queryKey: ['lottery', 'tickets'] });
				};
				await toast.promise(promise, {
					loading: t('sent.title'),
					success: t('sent.description'),
					error: errors('unknown'),
				});
			} else {
				toast.error(errors('unknown'));
			}
		},
	});
};

export const useManualRequest = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.manualRequest' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
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
				const promise = async () => {
					await waitForTransactionReceipt(config, {
						hash: data,
					});
					await queryClient.invalidateQueries({ queryKey: ['lottery', 'round'] });
				};
				await toast.promise(promise, {
					loading: t('sent.title'),
					success: t('sent.description'),
					error: errors('unknown'),
				});
			} else {
				toast.error(errors('unknown'));
			}
		},
	});
};

export const useManualRefund = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.manualRefund' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
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
				const promise = async () => {
					await waitForTransactionReceipt(config, {
						hash: data,
					});
					await queryClient.invalidateQueries({ queryKey: ['lottery', 'round'] });
				};
				await toast.promise(promise, {
					loading: t('sent.title'),
					success: t('sent.description'),
					error: errors('unknown'),
				});
			} else {
				toast.error(errors('unknown'));
			}
		},
	});
};

export const useManualDistributeRefund = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.manualDistributeRefund' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
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
				const promise = async () => {
					await waitForTransactionReceipt(config, {
						hash: data,
					});
					await queryClient.invalidateQueries({ queryKey: ['lottery', 'round'] });
				};
				await toast.promise(promise, {
					loading: t('sent.title'),
					success: t('sent.description'),
					error: errors('unknown'),
				});
			} else {
				toast.error(errors('unknown'));
			}
		},
	});
};

export const useManualDistributeJackpot = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.manualDistributeJackpot' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
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
				const promise = async () => {
					await waitForTransactionReceipt(config, {
						hash: data,
					});
					await queryClient.invalidateQueries({ queryKey: ['lottery', 'round'] });
				};
				await toast.promise(promise, {
					loading: t('sent.title'),
					success: t('sent.description'),
					error: errors('unknown'),
				});
			} else {
				toast.error(errors('unknown'));
			}
		},
	});
};

export const useClaimTicket = () => {
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.claimTicket' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
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
				const promise = async () => {
					await waitForTransactionReceipt(config, {
						hash: data,
					});
					await queryClient.invalidateQueries({ queryKey: ['lottery'] });
				};
				await toast.promise(promise, {
					loading: t('sent.title'),
					success: t('sent.description'),
					error: errors('unknown'),
				});
			} else {
				toast.error(errors('unknown'));
			}
		},
	});
};

export const useLoadMintedTokens = () => {
	const config = useConfig();
	return useMutation<IRoundTicket[], never, { hash: Address }>({
		mutationKey: ['lottery', 'ticketsByHash'],
		mutationFn: ({ hash }) => getMintedTokensByHash(hash, config),
	});
};

export const useClaimUnclaimedTickets = () => {
	const config = useConfig();
	const queryClient = useQueryClient();
	const { t } = useTranslation('lottery', { keyPrefix: 'toasts.claimUnclaimedTickets' });
	const { t: errors } = useTranslation('shared', { keyPrefix: 'errors' });
	return useMutation<WriteContractReturnType, WriteContractErrorType, { tickets: bigint[] }>({
		mutationKey: ['lottery', 'claimUnclaimedTickets'],
		mutationFn: ({ tickets }) => claimUnclaimedTickets(tickets, config),
		onError: (error) => {
			console.log(error);
		},
		onSuccess: async (data) => {
			if (data !== undefined) {
				const promise = async () => {
					await waitForTransactionReceipt(config, {
						hash: data,
					});
					await queryClient.invalidateQueries({ queryKey: ['lottery', 'unclaimedTickets'] });
				};
				await toast.promise(promise, {
					loading: t('sent.title'),
					success: t('sent.description'),
					error: errors('unknown'),
					action: getTransactionLink(data),
				});
			} else {
				toast.error(errors('unknown'));
			}
		},
	});
};
