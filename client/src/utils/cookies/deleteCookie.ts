import setCookie from './setCookie';

function deleteCookie(name: any) {
	setCookie(name, '', {
		'max-age': -1,
	});
}

export default deleteCookie;
