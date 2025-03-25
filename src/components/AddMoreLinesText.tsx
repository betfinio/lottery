import type { FC } from 'react';

export const AddMoreLinesText: FC = () => {
	return (
		<div className="text-sm text-secondary-foreground m-2">
			<div className="text-muted-foreground mb-2"> Ticket with 3 or more lines has active SYMBOL which brings you:</div>
			<ul className="list-disc list-inside">
				<li>SUPERJACKPOT with 4% pooled bonus from all past rounds without superjackpot.</li>
				<li>Up to 8x higher payout in comparison to same ticket without active symbol</li>
				<li>Free ticket in case of just 2 guessed numbers</li>
			</ul>
		</div>
	);
};
