import { useDraftLines, useFreeLinesCount, useMultiAllowance, useSelectedRound, useTicketPrice } from '@/src/lib/query';
import { type BuyTicketProps, useBuyTicket, useLoadMintedTokens, useUnlockMultibet } from '@/src/lib/query/mutations';
import { useDrawInfoTab, useRoundState } from '@/src/lib/query/state';
import { EMPTY_LINE, type IRoundTicket, RoundState } from '@/src/lib/types';
import { shootConfetti } from '@/src/lib/utils';
import { ZeroAddress } from '@betfinio/abi';
import { cn } from '@betfinio/components';
import { BetValue } from '@betfinio/components/shared';
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, Separator, toast } from '@betfinio/components/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useBalance } from 'betfinio_context/lib/query';
import { CheckIcon, LoaderIcon, LockIcon, ShoppingCartIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Address } from 'viem';
import { useAccount } from 'wagmi';
// Steps for the ticket purchase flow
export type Step = 'unlock' | 'buy' | 'done';

interface BuyStepsProps {
	buy: BuyTicketProps; // Ticket purchase parameters
	isOpen: boolean; // Dialog open state
	setIsOpen: (isOpen: boolean) => void; // Dialog state setter
}

/**
 * BuySteps component handles the multi-step process of purchasing lottery tickets
 * Steps:
 * 1. Unlock multibet contract (if not already unlocked)
 * 2. Purchase tickets
 */
function BuySteps({ buy, isOpen, setIsOpen }: BuyStepsProps) {
	const { t } = useTranslation('lottery');
	// State and hooks
	const [step, setStep] = useState<Step>('unlock');
	const { address } = useAccount();
	const queryClient = useQueryClient();

	// Queries
	const { data: selectedRound } = useSelectedRound();
	const { data: unlocked = 0n } = useMultiAllowance(address);
	const { data: ticketPrice = 0n } = useTicketPrice(selectedRound?.address);
	const { updateState } = useRoundState(selectedRound?.address);
	const { data: balance = 0n } = useBalance(address ?? ZeroAddress);

	const { data: freeLines = 0n } = useFreeLinesCount(address ?? ZeroAddress);

	// Mutations
	const { mutateAsync: unlock, isPending: isUnlockPending, reset: resetUnlock } = useUnlockMultibet();
	const { mutateAsync: buyTickets, isSuccess: isBuySuccess, isPending: isBuyPending, reset: resetBuy, data } = useBuyTicket();
	const { mutateAsync: logsByHash } = useLoadMintedTokens();
	const { setTickets } = useDraftLines();
	const { setTab } = useDrawInfoTab();
	// Reset step when dialog opens
	useEffect(() => {
		if (isOpen) {
			setStep('unlock');
		}
	}, [isOpen]);

	const totalAmount = BigInt(buy.lines.length) * BigInt(buy.rounds.length) * ticketPrice - freeLines * ticketPrice;

	// Auto-advance to buy step if already unlocked
	useEffect(() => {
		if (unlocked >= totalAmount && step === 'unlock') {
			setStep('buy');
		}
	}, [unlocked, step, totalAmount]);

	// Cleanup after purchase completion
	useEffect(() => {
		if (step === 'done') {
			setIsOpen(false);
			resetUnlock();
			resetBuy();
			setTickets([EMPTY_LINE]);
			shootConfetti();
			updateState(RoundState.FILLING);
			setTab('active');

			// Merge fresh on-chain data with subgraph data
			logsByHash({ hash: data as Address }).then((newTickets) => {
				queryClient.setQueryData<IRoundTicket[]>(['lottery', 'tickets', 'active', address?.toLowerCase()], (old = []) => [
					...newTickets.map((t) => ({ ...t, isLocal: true })), // Mark fresh tickets
					...old.filter((ot) => !newTickets.some((nt) => nt.token === ot.token)), // Remove duplicates
				]);
			});
		}
	}, [step, address, queryClient]);

	// Handlers
	const handleUnlock = async () => {
		try {
			await unlock();
			setStep('buy');
		} catch (error) {
			setStep('unlock');
		}
	};

	const handleBuy = async () => {
		if (balance < totalAmount) {
			toast.error('Insufficient balance, bro');
			return;
		}
		try {
			await buyTickets({ ...buy });
			setStep('done');
		} catch (error) {
			setStep('buy');
		}
	};

	const onNext = () => {
		if (step === 'unlock') {
			handleUnlock();
		} else if (step === 'buy') {
			handleBuy();
		}
	};

	const isUnlocked = step !== 'unlock';

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="lottery rounded-xl">
				<div className="w-[300px] p-4 flex flex-col gap-4">
					<DialogTitle className="font-normal flex justify-between text-muted-foreground">
						{t('youAreBuyingTicket')}
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
								<div>{t('unlockMultibetContract')}</div>
							</div>

							<Separator orientation="vertical" className="h-4 ml-3" />

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
									Buy {buy.rounds.length} ticket(s) for <BetValue value={totalAmount} withIcon />
								</div>
							</div>
							{freeLines > 0n && (
								<div className="text-sm text-muted-foreground text-center">
									Your <span className=" text-primary">{Number(freeLines)} free lines</span> will be used
								</div>
							)}
							{/* Action buttons */}
							<div className="grid grid-cols-2 gap-2 mt-2">
								<DialogClose asChild>
									<Button variant={'ghost'} size="sm">
										{t('cancel')}
									</Button>
								</DialogClose>
								<Button size={'sm'} onClick={onNext} className="gap-2">
									{isBuyPending || isUnlockPending ? <LoaderIcon className="w-3 h-3 animate-spin" /> : null}
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
