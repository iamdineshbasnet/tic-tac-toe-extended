import { createSlice } from '@reduxjs/toolkit';
import { CommonProps } from './types';

const initialState: CommonProps = {
	turn: 'x',
	data: ['', '', '', '', '', '', '', '', ''],
	isDraw: false,
	history: [],
	disabledCell: null,
	winningCombination: [],
};

const commonSlice = createSlice({
	name: 'common',
	initialState,
	reducers: {
		setTurn: (state, { payload }) => {
			state.turn = payload;
		},
		setData: (state, { payload }) => {
			state.data = payload;
		},
		setIsDraw: (state, { payload }) => {
			state.isDraw = payload;
		},
		setHistory: (state, { payload }) => {
			state.history = payload;
		},
		setDisabledCell: (state, { payload }) => {
			state.disabledCell = payload;
		},
		setWinningCombination: (state, { payload }) => {
			state.winningCombination = payload;
		},
	},
});

export const { setTurn, setData, setIsDraw, setHistory, setDisabledCell, setWinningCombination } =
	commonSlice.actions;
export default commonSlice.reducer;
