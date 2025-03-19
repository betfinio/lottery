import { useLocalStorage } from '@/src/lib/query/state';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
	Checkbox,
} from '@betfinio/components/ui';
import { type MouseEvent, type PropsWithChildren, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface AlertProps extends PropsWithChildren {
	storageKey: string;
	trigger: ReactNode;
	isValid: boolean;
	onSuccess: () => void;
}

function Alert({ storageKey, children, trigger, isValid, onSuccess }: AlertProps) {
	const { t } = useTranslation('lottery');
	const [isOpen, setOpen] = useState(false);

	const { value = false, setValue } = useLocalStorage<boolean>(storageKey);
	const [checkboxChecked, setCheckboxChecked] = useState(false);
	const handleClick = (e: MouseEvent) => {
		if (!isValid) {
			onSuccess();
			return;
		}
		if (value === true) {
			onSuccess();
			return;
		}
		setOpen(true);
	};

	const handleSuccess = () => {
		if (checkboxChecked) {
			setValue(true);
		}
		setOpen(false);
		onSuccess();
	};

	const handleCheckboxChange = (checked: boolean) => {
		setCheckboxChecked(checked);
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setOpen(false);
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
			<AlertDialogTrigger asChild onClick={handleClick}>
				{trigger}
			</AlertDialogTrigger>
			<AlertDialogContent className="lottery">
				<AlertDialogTitle className="hidden" />
				<AlertDialogDescription className="hidden" />
				{children}
				<div className="flex flex-row items-center gap-2 text-sm">
					<Checkbox id={storageKey} onCheckedChange={handleCheckboxChange} />
					<label htmlFor={storageKey}>{t('dontAskAgain')}</label>
				</div>
				<div className="grid grid-cols-3 gap-2 items-center">
					<AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
					<AlertDialogAction className="col-start-3" onClick={handleSuccess}>
						{t('confirm')}
					</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default Alert;
