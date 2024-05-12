import { createAsyncThunk } from '@reduxjs/toolkit';
import * as API from './api';

// create guest account
export const createGuest = createAsyncThunk(
	'guest/registration',
	async (values: {name: string}, { rejectWithValue }) => {
		try {
			const { data } = await API.guestRegistration(values);
			return data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);
