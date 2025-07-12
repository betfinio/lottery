import { Button, DialogTitle, Input } from '@betfinio/components/ui';
import { LoaderIcon } from 'lucide-react';
import { useState } from 'react';
import { type Address, isAddress } from 'viem';
import { useSendTicket } from '../lib/query/mutations';
import type { IRoundTicket } from '../lib/types';

function SendTicket({ ticket, onClose }: { ticket: IRoundTicket; onClose: () => void }) {
	const [recipient, setRecipient] = useState('');
	const [changed, setChanged] = useState(false);
	const { mutateAsync: sendTicket, isPending } = useSendTicket();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setRecipient(e.target.value);
		setChanged(true);
	};

	const handleSend = async () => {
		await sendTicket({
			ticket: BigInt(ticket.token),
			recipient: recipient.toLowerCase() as Address,
		});
		onClose();
	};
	const isValidAddress = isAddress(recipient, { strict: false });

	return (
		<div className="p-2 md:p-3 lg:p-4 md:w-[450px] w-[98vw] flex flex-col gap-2">
			<DialogTitle className="font-normal">Send a ticket to an address</DialogTitle>
			<Input autoComplete="off" placeholder={'0x1234567890abcdefabcd1234567890abcdefabcd'} value={recipient} onChange={handleChange} />
			{!isValidAddress && changed && <div className="text-sm text-destructive">Invalid address</div>}
			<div className="items-center justify-between grid grid-cols-3">
				<Button variant="outline" size="sm" onClick={onClose}>
					Cancel
				</Button>
				<Button
					className={'gap-1 col-start-3'}
					size={'sm'}
					disabled={!recipient || !isValidAddress || !changed}
					onClick={() => recipient && isValidAddress && handleSend()}
				>
					{isPending ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Send'}
				</Button>
			</div>
		</div>
	);
}

export default SendTicket;
