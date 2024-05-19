import { createAsyncThunk } from '@reduxjs/toolkit';
import * as API from './api';

export const createRoom = createAsyncThunk('create/room', async (_, { rejectWithValue }) => {
	try {
		const { data } = await API.createRoom();

		return data;
	} catch (error) {
		return rejectWithValue(error);
	}
});

export const joinRoom = createAsyncThunk('join/room', async (id: string, { rejectWithValue }) => {
	try {
		const { data } = await API.joinRoom(id);

		return data;
	} catch (error) {
		return rejectWithValue(error);
	}
});

export const getRoomDetails = createAsyncThunk(
	'get/room',
	async (id: string, { rejectWithValue }) => {
		try {
			const { data } = await API.getRoom(id);
			return data;
		} catch (error) {
			return rejectWithValue(error);
		}
	}
);
