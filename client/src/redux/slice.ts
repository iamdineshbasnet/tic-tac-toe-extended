import { createSlice } from '@reduxjs/toolkit';
import { CommonProps } from './types';

const initialState: CommonProps = {
	round: 1,
	mode: ''
};

const commonSlice = createSlice({
	name: 'common',
	initialState,
	reducers: {
		setRound: (state, { payload })=>{
			state.round = payload
		},
		setMode: (state, { payload }) =>{
			state.mode = payload
		}
	},
});

export const { setRound, setMode } =
	commonSlice.actions;
export default commonSlice.reducer;
