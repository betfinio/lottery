import { useChatbot } from 'betfinio_context/lib/context';
import { AlertCircle, CircleHelp } from 'lucide-react';
import Ticket from '../icons/Ticket';

const Header = () => {
	const { toggle } = useChatbot();
	const handleReport = () => {
		toggle();
	};
	return (
		<div className={'w-full border border-border rounded-lg bg-background-lighter p-2 md:p-3 lg:p-4 flex flex-row justify-between min-h-[70px] items-center'}>
			<div className="flex flex-row items-center justify-center gap-2 lg:gap-3">
				<Ticket />
				<div className="flex flex-col gap-0">
					<div>Lotto 5 of 25</div>
					<div className="text-sm text-muted-foreground">Twice a week</div>
				</div>
			</div>
			<div className="flex flex-row items-center justify-center gap-2 lg:gap-3">
				<a
					target={'_blank'}
					href={'https://betfin.gitbook.io/betfin-public/v/games-manual/games-guide/predict-game'}
					className={
						'flex flex-col items-center justify-center cursor-pointer text-secondary-foreground hover:text-secondary-foreground lg:text-foreground duration-300'
					}
					rel="noreferrer"
				>
					<CircleHelp className={'w-6 h-6'} />
					<span className={'hidden sm:inline text-xs'}>How to play</span>
				</a>
				<div className={'flex flex-col items-center text-secondary-foreground group lg:text-foreground hover:text-secondary-foreground text-xs cursor-pointer'}>
					<AlertCircle className={'w-6 h-6'} onClick={handleReport} />
					<span className={'hidden md:block'}>Report</span>
				</div>
			</div>
		</div>
	);
};

export default Header;
