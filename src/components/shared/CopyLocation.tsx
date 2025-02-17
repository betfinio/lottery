import { cn } from '@betfinio/components';
import { useToast } from '@betfinio/components/hooks';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { type FC, useState } from 'react';

interface CopyLocationProps {
	toastMessage: string;
	className?: string;
}
export const CopyLocation: FC<CopyLocationProps> = ({ toastMessage, className }) => {
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
		<>
			{addressCopied ? (
				<CheckIcon className={cn('text-success', className)} />
			) : (
				<CopyIcon className={cn('text-secondary-foreground cursor-pointer ', className)} onClick={handleCopyRoundAddress} />
			)}
		</>
	);
};
