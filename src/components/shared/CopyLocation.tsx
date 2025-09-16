import { cn } from '@betfinio/components';
import { toast } from '@betfinio/components/ui';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useState } from 'react';

interface CopyLocationProps {
	toastMessage: string;
	className?: string;
	iconClassName?: string;
	children?: React.ReactNode;
}

export const CopyLocation = ({ toastMessage, className, iconClassName, children }: CopyLocationProps) => {
	const [addressCopied, setAddressCopied] = useState(false);

	const handleCopyRoundAddress = async () => {
		await navigator.clipboard.writeText(location.href);
		toast.info(toastMessage);
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
};
