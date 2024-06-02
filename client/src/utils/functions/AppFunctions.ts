export function getOrdinalSuffix(num: number) {
	if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
		return num;
	}

	const lastDigit = num % 10;
	const lastTwoDigits = num % 100;

	if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
		return num + 'th';
	}

	switch (lastDigit) {
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		default:
			return 'th';
	}
}
