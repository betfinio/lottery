import { Button, Checkbox, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@betfinio/components/ui';
import { type PropsWithChildren, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '@/src/lib/query/state';

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
	const handleClick = () => {
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
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild onClick={handleClick}>
				{trigger}
			</DialogTrigger>
			<DialogContent>
				<div className="flex flex-col gap-4  w-[98vw] md:max-w-[500px] max-w-[384px] p-2 md:p-4">
					<DialogTitle className="hidden" />
					<DialogDescription className="hidden" />
					{children}
					<div className="flex flex-row items-center gap-2 text-sm">
						<Checkbox id={storageKey} onCheckedChange={handleCheckboxChange} />
						<label htmlFor={storageKey}>{t('dontAskAgain')}</label>
					</div>
					<div className="grid grid-cols-3 gap-2 items-center">
						<DialogClose>{t('cancel')}</DialogClose>
						<Button className="col-start-3" onClick={handleSuccess}>
							{t('confirm')}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default Alert;
