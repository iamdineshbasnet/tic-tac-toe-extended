import axios from 'axios';
import getCookie from './cookies/getCookie';
import deleteCookie from './cookies/deleteCookie';
import setCookie from './cookies/setCookie';

export const axiosInstance = axios.create({
	baseURL: `${import.meta.env.REACT_APP_BASE_URL}${import.meta.env.REACT_APP_VERSION}`,
});

axiosInstance.interceptors.request.use(
	(config: any) => {
		// Doing something before request is sent thu
		if (!window.navigator.onLine) {
			return Promise.reject('No Internet');
		} else {
			const contentType = determineContentType(config.data);
			config.headers = {
				Authorization: getCookie('accessToken') ? `Bearer ${getCookie('accessToken')}` : '',
				'Content-Type': contentType,
			};

			return config;
		}
	},
	(error) => {
		// reject request error
		return Promise.reject(error);
	}
);

//  determine content type
function determineContentType(data: any) {
	if (typeof data === 'object' && data instanceof FormData) {
		return 'multipart/form-data';
	} else {
		return 'application/json';
	}
}

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		// internal server error
		if (error.response?.status === 500 || error.response?.status > 500) {
			alert('Internal Server Error');
		} //to handle forbidden response status
		else if (error.response?.status === 403) {
			alert("You don't have permission to access on this server");
		} //for handling page not found
		else if (error.response?.status === 404) {
			alert('Page Not Found');
		}

		const originalRequest = error.config;
		//when refresh token is also not valid and preventing the infinite loop
		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				const body = JSON.stringify({
					token: getCookie('refreshToken'),
				});
				deleteCookie('accessToken');
				const response = await axiosInstance.post(`/refresh`, body);
				if (response.status === 201) {
					setCookie('accessToken', response?.data?.accessToken, {
						secure: true,
						'max-age': 86400, // 1 day
						sameSite: 'Lax',
					});
					originalRequest.headers[
						'Authorization'
					] = `Bearer ${response?.data?.accessToken}`;
					return axiosInstance(originalRequest);
				}
			} catch (error) {
				alert('Refresh Expire');
			}
		}
		// Do something with response error
		return Promise.reject(error);
	}
);
