import { createSlice } from '@reduxjs/toolkit';
import { RoomProps } from './types';

const initialState: RoomProps = {
	round: 1,
	mode: '',
	roomCode: '',
	roomDetails: null,
};

const roomSlice = createSlice({
	name: 'room',
	initialState,
	reducers: {
		setRound: (state, { payload })=>{
			state.round = payload
		},
		setMode: (state, { payload }) =>{
			state.mode = payload
		},
		setRoomCode: (state, { payload })=>{
			state.roomCode = payload
		},
		setRoomDetails: (state, { payload })=>{
			state.roomDetails = payload
		}
	},
});

export const { setRound, setMode, setRoomCode, setRoomDetails } =
	roomSlice.actions;
export default roomSlice.reducer;
