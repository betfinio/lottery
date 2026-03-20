import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@betfinio/components/ui';
import { Ticket } from '../icons';

export const FreeTicketTooltip = () => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger>
					<Ticket className="w-4 h-4 text-success" />
				</TooltipTrigger>
				<TooltipContent>Free Line(s)</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
