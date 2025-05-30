import { useActiveTickets, useEditAllowance, useSelectedRound, useTicketPrice } from '@/src/lib/query';
import { useUnlockEdit, useUpdateTicket } from '@/src/lib/query/mutations';
import type { IRoundTicket } from '@/src/lib/types';
import { shootConfetti } from '@/src/lib/utils';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, Separator } from '@betfinio/components/ui';
import { useQueryClient } from '@tanstack/react-query';
import { CheckIcon, LoaderIcon, LockIcon, ShoppingCartIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
// Steps for the ticket edit flow
export type Step = 'unlock' | 'edit' | 'done';

interface EditStepsProps {
	ticket: IRoundTicket; // Ticket purchase parameters
	isOpen: boolean; // Dialog open state
	setIsOpen: (isOpen: boolean, closeParent?: boolean) => void; // Dialog state setter
}

function EditSteps({ ticket, isOpen, setIsOpen }: EditStepsProps) {
	const { t } = useTranslation('lottery');
	// State and hooks
	const [step, setStep] = useState<Step>('unlock');
	const { address } = useAccount();
	const queryClient = useQueryClient();

	// Queries
	const { data: selectedRound } = useSelectedRound();
	const { data: unlocked = 0n } = useEditAllowance(address);
	const { data: ticketPrice = 0n } = useTicketPrice(selectedRound?.address);
	const { refetch: refetchActiveTickets } = useActiveTickets(address);

	// Mutations
	const { mutateAsync: unlock, isPending: isUnlockPending, reset: resetUnlock } = useUnlockEdit();
	const { mutateAsync: editTicket, isPending: isEditPending, isSuccess: isEditSuccess, data } = useUpdateTicket();

	// Reset step when dialog opens
	useEffect(() => {
		if (isOpen) {
			setStep('unlock');
		}
	}, [isOpen]);

	// Auto-advance to buy step if already unlocked
	useEffect(() => {
		if (unlocked > (ticketPrice * 100n) / 10n && step === 'unlock') {
			setStep('edit');
		}
	}, [unlocked, step]);

	// Cleanup after purchase completion
	useEffect(() => {
		if (step === 'done') {
			setIsOpen(false, true);
			resetUnlock();
			shootConfetti();
			refetchActiveTickets();
		}
	}, [step, address, queryClient]);

	useEffect(() => {
		if (isEditSuccess && data) {
			setStep('done');
		}
	}, [data, isEditSuccess]);
	// Handlers
	const handleUnlock = async () => {
		try {
			await unlock();
			setStep('edit');
		} catch (error) {
			setStep('unlock');
		}
	};

	const handleEdit = async () => {
		try {
			await editTicket({ ticket });
		} catch (error) {
			setStep('edit');
		}
	};

	const onNext = () => {
		if (step === 'unlock') {
			handleUnlock();
		} else if (step === 'edit') {
			handleEdit();
		}
	};

	// Derived state
	const isUnlocked = step !== 'unlock';
	const totalAmount = (ticketPrice / 100n) * 10n;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="lottery rounded-xl">
				<div className="w-[300px] p-4 flex flex-col gap-4">
					<DialogTitle className="font-normal flex justify-between text-muted-foreground">
						{t('youAreEditingTicket')}
						<DialogClose>
							<XIcon className="w-4 h-4" />
						</DialogClose>
					</DialogTitle>
					<DialogDescription className="flex flex-col gap-2" asChild>
						<div className="flex flex-col gap-2">
							{/* Unlock step indicator */}
							<div className={cn('flex items-center gap-2', isUnlocked && 'text-success')}>
								<div
									className={cn(
										'w-6 h-6 rounded-full bg-border flex items-center justify-center',
										isUnlocked && 'bg-success text-success-foreground',
										step === 'unlock' && 'bg-primary text-primary-foreground',
									)}
								>
									{isUnlockPending ? (
										<LoaderIcon className="w-3 h-3 animate-spin" />
									) : isUnlocked ? (
										<CheckIcon className="w-3 h-3" />
									) : (
										<LockIcon className="w-3 h-3" />
									)}
								</div>
								<div>{t('unlockEditContract')}</div>
							</div>

							<Separator orientation="vertical" className="h-4 ml-3" />

							{/* Buy step indicator */}
							<div className={cn('flex items-center gap-2', isEditSuccess && 'text-success')}>
								<div
									className={cn(
										'w-6 h-6 rounded-full bg-border flex items-center justify-center',
										isEditSuccess && 'bg-success text-success-foreground',
										step === 'edit' && 'bg-primary text-primary-foreground',
									)}
								>
									{isEditPending ? (
										<LoaderIcon className="w-3 h-3 animate-spin" />
									) : isEditSuccess ? (
										<CheckIcon className="w-3 h-3" />
									) : (
										<ShoppingCartIcon className="w-3 h-3" />
									)}
								</div>
								<div className="flex items-center flex-row gap-1">
									{t('editTicketFor')} <BetValue value={totalAmount} withIcon />
								</div>
							</div>

							{/* Action buttons */}
							<div className="grid grid-cols-2 gap-2 mt-2">
								<DialogClose asChild>
									<Button variant={'ghost'} size="sm">
										{t('cancel')}
									</Button>
								</DialogClose>
								<Button size={'sm'} onClick={onNext} className="gap-2">
									{isEditPending || isUnlockPending ? <LoaderIcon className="w-3 h-3 animate-spin" /> : null}
									{t('proceed')}
								</Button>
							</div>
						</div>
					</DialogDescription>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default EditSteps;
