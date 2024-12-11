export interface TimeDiff {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}
export const getDiff = (start: number, end: number): TimeDiff => {
	const diff = end - start;
	const days = Math.floor(diff / (60 * 60 * 24));
	const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
	const minutes = Math.floor((diff % (60 * 60)) / 60);
	const seconds = Math.floor(diff % 60);
	return { days, hours, minutes, seconds };
};
