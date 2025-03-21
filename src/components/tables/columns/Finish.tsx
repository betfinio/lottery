import { DateTime } from 'luxon';

function Finish({ timestamp }: { timestamp: number }) {
	return DateTime.fromSeconds(timestamp).toFormat('DD');
}
export default Finish;
