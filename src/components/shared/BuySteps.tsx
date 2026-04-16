import { ZeroAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, toast } from '@betfinio/components/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useBalance } from 'betfinio_context/lib/query';
import { CheckIcon, LoaderIcon, ShoppingCartIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useDraftTickets, useTicketPrice } from '@/src/lib/query';

import { type PlaceBetProps, usePlaceBet } from '@/src/lib/query/mutations';
import { useDrawInfoTab } from '@/src/lib/query/state';
import { EMPTY_TICKET } from '@/src/lib/types';
import { shootConfetti } from '@/src/lib/utils';

// Steps for the ticket purchase flow (unlock step removed in v2)
export type Step = 'buy' | 'done';

interface BuyStepsProps {
	buy: PlaceBetProps; // Bet placement parameters
	isOpen: boolean; // Dialog open state
	setIsOpen: (isOpen: boolean) => void; // Dialog state setter
}

/**
 * BuySteps component handles the process of purchasing lottery tickets.
 * In v2 there is no multibet unlock step - just buy directly.
 */
function BuySteps({ buy, isOpen, setIsOpen }: BuyStepsProps) {
	const { t } = useTranslation('lottery');
	// State and hooks
	const [step, setStep] = useState<Step>('buy');
	const { address } = useAccount();
	const queryClient = useQueryClient();

	// Queries
	const { data: ticketPrice = 0n } = useTicketPrice();
	const { data: balance = 0n } = useBalance(address ?? ZeroAddress);

	// Mutations
	const { mutateAsync: placeBet, isSuccess: isBuySuccess, isPending: isBuyPending, reset: resetBuy } = usePlaceBet();
	const { setTickets } = useDraftTickets();
	const { setTab } = useDrawInfoTab();

	// Reset step when dialog opens
	useEffect(() => {
		if (isOpen) {
			setStep('buy');
		}
	}, [isOpen]);

	const totalAmount = BigInt(buy.tickets.length) * BigInt(buy.roundIds.length) * ticketPrice;

	// Cleanup after purchase completion
	useEffect(() => {
		if (step === 'done') {
			setIsOpen(false);
			resetBuy();
			shootConfetti();

			if (buy.recipient.toLowerCase() !== address?.toLowerCase()) {
				return;
			}

			setTab('active');
			setTickets([EMPTY_TICKET]);

			queryClient.invalidateQueries({ queryKey: ['lottery'] });
			setStep('buy');
		}
	}, [step, address, queryClient]);

	// Handlers
	const handleBuy = async () => {
		if (balance < totalAmount) {
			toast.error('Insufficient balance, bro');
			return;
		}
		try {
			await placeBet({ ...buy });
			setStep('done');
		} catch {
			setStep('buy');
		}
	};

	const onNext = () => {
		handleBuy();
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="rounded-xl">
				<div className="w-[300px] p-4 flex flex-col gap-4">
					<DialogTitle className="font-normal flex justify-between text-muted-foreground">
						{t('youAreBuyingTicket')}
						<DialogClose>
							<XIcon className="w-4 h-4" />
						</DialogClose>
					</DialogTitle>
					<DialogDescription className="flex flex-col gap-2" asChild>
						<div className="flex flex-col gap-2">
							{/* Buy step indicator */}
							<div className={cn('flex items-center gap-2', isBuySuccess && 'text-success')}>
								<div
									className={cn(
										'w-6 h-6 rounded-full bg-border flex items-center justify-center',
										isBuySuccess && 'bg-success text-success-foreground',
										step === 'buy' && 'bg-primary text-primary-foreground',
									)}
								>
									{isBuyPending ? (
										<LoaderIcon className="w-3 h-3 animate-spin" />
									) : isBuySuccess ? (
										<CheckIcon className="w-3 h-3" />
									) : (
										<ShoppingCartIcon className="w-3 h-3" />
									)}
								</div>
								<div className="flex items-center flex-row gap-1">
									Buy {buy.roundIds.length} ticket(s) for <BetValue value={totalAmount} withIcon />
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
									{isBuyPending ? <LoaderIcon className="w-3 h-3 animate-spin" /> : null}
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

export default BuySteps;
