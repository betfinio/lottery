import { cn } from '@betfinio/components';
import { toast } from '@betfinio/components/ui';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { forwardRef, useState } from 'react';

interface CopyLocationProps {
	toastMessage: string;
	className?: string;
	iconClassName?: string;
	children?: React.ReactNode;
}
export const CopyLocation = forwardRef<HTMLDivElement, CopyLocationProps>(({ toastMessage, className, iconClassName, children }) => {
	const [addressCopied, setAddressCopied] = useState(false);

	const handleCopyRoundAddress = async () => {
		toast.success(toastMessage);
		await navigator.clipboard.writeText(location.href);
		setAddressCopied(true);
		setTimeout(() => {
			setAddressCopied(false);
		}, 5000);
	};

	return (
		<div className={cn('cursor-pointer', className)} onClick={() => !addressCopied && handleCopyRoundAddress()}>
			{addressCopied ? (
				<CheckIcon className={cn('text-success', iconClassName)} />
			) : (
				<CopyIcon className={cn('text-secondary-foreground cursor-pointer ', iconClassName)} />
			)}
			{children}
		</div>
	);
});
