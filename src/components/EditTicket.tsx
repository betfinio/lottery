import Ticket from '@/src/components/Ticket.tsx';
import type { IRoundTicket } from '@/src/lib/types.ts';
import { equals } from '@/src/lib/utils';
import { Button, DialogClose, DialogDescription, DialogTitle } from '@betfinio/components/ui';
import { useState } from 'react';
import EditSteps from './shared/EditSteps';

export interface EditTicketProps {
	ticket: IRoundTicket;
	onClose: () => void;
}
function EditTicket({ ticket, onClose }: EditTicketProps) {
	const [saveEnabled, setSaveEnabled] = useState(false);
	const [newLines, setNewLines] = useState(ticket.lines);
	const [isOpen, setIsOpen] = useState(false);
	const handleUpdate = (newTicket: IRoundTicket) => {
		const edited = ticket.lines.filter((e, index) => !equals(e, newTicket.lines[index]));
		if (edited.length > 0) {
			setSaveEnabled(true);
			setNewLines(newTicket.lines);
		} else {
			setSaveEnabled(false);
		}
	};

	const onSave = async () => {
		setIsOpen(true);
	};

	const handleSetIsOpen = (isOpen: boolean) => {
		setIsOpen(isOpen);
		if (!isOpen) {
			onClose();
		}
	};

	return (
		<>
			<EditSteps ticket={{ ...ticket, lines: newLines }} isOpen={isOpen} setIsOpen={handleSetIsOpen} />
			<div className={'max-w-[384px] w-[98vw] mx-auto p-2 md:p-3 lg:p-4 flex flex-col gap-2 md:gap-3 lg:gap-4'}>
				<DialogTitle className={'hidden'} />
				<DialogDescription aria-describedby={undefined} className={'hidden'} />
				<Ticket ticket={ticket} mode={'expanded'} onUpdate={handleUpdate} isExpandable={false} />
				<div className={'flex justify-between'}>
					<DialogClose asChild>
						<Button className={'w-1/4'} variant={'destructive'}>
							Cancel
						</Button>
					</DialogClose>
					<Button variant={'success'} className={'w-1/4'} onClick={onSave} disabled={!saveEnabled}>
						Save
					</Button>
				</div>
			</div>
		</>
	);
}

export default EditTicket;
