import type { IBet } from '../lib/types';
import Lost from './status/Lost';
import Refunded from './status/Refunded';
import Win from './status/Win';

function TicketStatus({ ticket }: { ticket: IBet }) {
	return (
		<>
			<Lost ticket={ticket} />
			<Win ticket={ticket} />
			<Refunded ticket={ticket} />
		</>
	);
}

export default TicketStatus;
