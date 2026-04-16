import { DateTime } from 'luxon';
import { getRoundTimes, useInterval, useRoundOffset } from '@/src/lib/query';

function Finish({ roundId }: { roundId: bigint }) {
	const { data: interval = 0n } = useInterval();
	const { data: offset = 0n } = useRoundOffset();

	if (interval === 0n) return <>...</>;

	const { end } = getRoundTimes(roundId, interval, offset);
	return DateTime.fromSeconds(end).toFormat('DD');
}
export default Finish;
