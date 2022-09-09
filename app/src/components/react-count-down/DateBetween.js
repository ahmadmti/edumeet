/* eslint-disable no-unused-expressions */
const DateBetween = (startDate, endDate) =>
{
	const second = 1000;

	const minute = second * 60;

	const hour = minute * 60;

	const day = hour * 24;

	const distance = endDate - startDate;

	if (distance < 0)
	{
		return false;
	}

	const days = Math.floor(distance / day);

	const hours = Math.floor((distance % day) / hour);

	const minutes = Math.floor((distance % hour) / minute);

	const seconds = Math.floor((distance % minute) / second);

	const between = [];

	// eslint-disable-next-line no-unused-expressions
	days > 0 ? between.push(`${days} day${days > 1 ? 's' : ''}`) : false;

	hours > 0 ? between.push(`${hours} hour${hours > 1 ? 's' : ''}`) : false;
	minutes > 0
		? between.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
		: false;
	seconds > 0
		? between.push(`${seconds} second${seconds > 1 ? 's' : ''}`)
		: false;

	return between.join(' ');
};

module.exports = DateBetween;
