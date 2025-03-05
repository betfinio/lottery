import Ticket from '@/src/components/Ticket.tsx';
import { useUpdateTicket } from '@/src/lib/query/mutations.ts';
import type { IRoundTicket } from '@/src/lib/types.ts';
import { equals } from '@/src/lib/utils';
import { Button, DialogClose, DialogDescription, DialogTitle } from '@betfinio/components/ui';
import { LoaderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useActiveTickets } from '../lib/query';

export interface EditTicketProps {
	ticket: IRoundTicket;
	onClose: () => void;
}
function EditTicket({ ticket, onClose }: EditTicketProps) {
	const { address } = useAccount();
	const [saveEnabled, setSaveEnabled] = useState(false);
	const { refetch: refetchActiveTickets } = useActiveTickets(address);
	const [newLines, setNewLines] = useState(ticket.lines);
	const { mutateAsync: edit, isPending, isSuccess, data } = useUpdateTicket();

	const handleUpdate = (newTicket: IRoundTicket) => {
		const edited = ticket.lines.filter((e, index) => !equals(e, newTicket.lines[index]));
		if (edited.length > 0) {
			setSaveEnabled(true);
			setNewLines(newTicket.lines);
		} else {
			setSaveEnabled(false);
		}
	};
	useEffect(() => {
		if (isSuccess && data) {
			onClose();
		}
	}, [isSuccess, data]);
	const onSave = async () => {
		await edit({ ticket: { ...ticket, lines: newLines } });
		refetchActiveTickets();
	};
	return (
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
				<Button variant={'success'} className={'w-1/4'} onClick={onSave} disabled={!saveEnabled || isPending}>
					{isPending ? <LoaderIcon className={'w-4 h-4 animate-spin'} /> : 'Save'}
				</Button>
			</div>
		</div>
	);
}

export default EditTicket;
