import { createAsyncThunk } from '@reduxjs/toolkit';
import * as API from './api';

// get player
export const getPlayer = createAsyncThunk('get/player', async (_, { rejectWithValue }) => {
	try {
		const { data } = await API.getPlayer();
		return data;
	} catch (error) {
		return rejectWithValue(error);
	}
});

// update player
export const updatePlayer = createAsyncThunk(
	'update/player',
	async (values: { name?: string; image?: string }, { rejectWithValue }) => {
		try {
			const { data } = await API.updatePlayer(values);
			return data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);

// delete player
export const deletePlayer = createAsyncThunk('delete/player', async (_, { rejectWithValue }) => {
	try {
		const { data } = await API.deletePlayer();
		return data;
	} catch (error) {
		return rejectWithValue(error);
	}
});
