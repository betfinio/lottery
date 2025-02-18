import { cn } from '@betfinio/components';
import { useToast } from '@betfinio/components/hooks';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { type FC, forwardRef, useState } from 'react';

interface CopyLocationProps {
	toastMessage: string;
	className?: string;
	iconClassName?: string;
	children?: React.ReactNode;
}
export const CopyLocation = forwardRef<HTMLDivElement, CopyLocationProps>(({ toastMessage, className, iconClassName, children }, ref) => {
	const { toast } = useToast();

	const [addressCopied, setAddressCopied] = useState(false);

	const handleCopyRoundAddress = async () => {
		toast({
			title: toastMessage,
			variant: 'default',
		});
		await navigator.clipboard.writeText(location.href);
		setAddressCopied(true);
		setTimeout(() => {
			setAddressCopied(false);
		}, 5000);
	};

	return (
		<div ref={ref} className={cn('cursor-pointer', className)} onClick={() => !addressCopied && handleCopyRoundAddress()}>
			{addressCopied ? (
				<CheckIcon className={cn('text-success', iconClassName)} />
			) : (
				<CopyIcon className={cn('text-secondary-foreground cursor-pointer ', iconClassName)} onClick={handleCopyRoundAddress} />
			)}
			{children}
		</div>
	);
});
