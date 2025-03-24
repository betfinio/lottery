import { Button, Input } from '@betfinio/components/ui';
import { LoaderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type Address, isAddress } from 'viem';
import { useSendTicket } from '../lib/query/mutations';
import type { IRoundTicket } from '../lib/types';

function SendTicket({ ticket, onClose }: { ticket: IRoundTicket; onClose: () => void }) {
	const [recipient, setRecipient] = useState('');

	const { mutateAsync: sendTicket, isPending } = useSendTicket();

	useEffect(() => {
		const result = isAddress(recipient);
		console.log(result);
	}, [recipient]);

	const handleSend = async () => {
		await sendTicket({ ticket: BigInt(ticket.token), recipient: recipient.toLowerCase() as Address });
		onClose();
	};

	return (
		<div className="p-2 md:p-3 lg:p-4 w-screen max-w-[96vw] lg:max-w-[384px] flex flex-col gap-2">
			<div className="text-sm text-muted-foreground">Send a ticket to an address</div>
			<Input placeholder="0x1234567890abcdef" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
			{!isAddress(recipient, { strict: false }) && <div className="text-sm text-destructive">Invalid address</div>}
			<div className="items-center justify-between grid grid-cols-4">
				<Button variant="outline" size="sm" onClick={onClose}>
					Cancel
				</Button>
				<Button variant="success" size="sm" className="col-start-4" onClick={handleSend} disabled={isPending}>
					{isPending ? <LoaderIcon className="w-4 h-4 animate-spin" /> : 'Send'}
				</Button>
			</div>
		</div>
	);
}

export default SendTicket;
