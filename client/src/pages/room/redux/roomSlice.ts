import { createSlice } from '@reduxjs/toolkit';
import { RoomProps } from './types';
import { createRoom, getRoomDetails, joinRoom } from './thunk';

const initialState: RoomProps = {
	round: 1,
	mode: '',
	roomCode: '',
	loadingCreateRoom: false,
	loadingJoinRoom: false,
	loadingRoomDetails: false,
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
	extraReducers: builder =>{
		// create room
		builder.addCase(createRoom.pending, (state)=>{
			state.loadingCreateRoom = true
		})
		builder.addCase(createRoom.fulfilled, (state)=>{
			state.loadingCreateRoom = false
		})
		builder.addCase(createRoom.rejected, (state)=>{
			state.loadingCreateRoom = false
		})

		// join room
		builder.addCase(joinRoom.pending, (state)=>{
			state.loadingJoinRoom = true
		})
		builder.addCase(joinRoom.fulfilled, (state)=>{
			state.loadingJoinRoom = false
		})
		builder.addCase(joinRoom.rejected, (state)=>{
			state.loadingJoinRoom = false
		})

		// get room details
		builder.addCase(getRoomDetails.pending, (state)=>{
			state.loadingJoinRoom = true
		})
		builder.addCase(getRoomDetails.fulfilled, (state, { payload : { result }})=>{
			state.loadingJoinRoom = false
			state.roomDetails = result
		})
		builder.addCase(getRoomDetails.rejected, (state)=>{
			state.loadingJoinRoom = false
		})
	}
});

export const { setRound, setMode, setRoomCode, setRoomDetails } =
	roomSlice.actions;
export default roomSlice.reducer;
