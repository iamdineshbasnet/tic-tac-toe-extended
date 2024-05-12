import { createAsyncThunk } from '@reduxjs/toolkit';
import * as API from './api';

export const getPlayer = createAsyncThunk('get/player', async (_, { rejectWithValue }) => {
	try {
		const { data } = await API.getPlayer();
		return data;
	} catch (error) {
		return rejectWithValue(error);
	}
});
