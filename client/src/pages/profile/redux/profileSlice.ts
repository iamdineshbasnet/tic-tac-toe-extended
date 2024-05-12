import { createSlice } from '@reduxjs/toolkit';
import { getPlayer } from './thunk';

interface PlayerProps {
	_id: string;
	name: string;
	username: string;
	email: string;
	image: string;
	isGuest: boolean;
	createdAt: string;
}

interface ProfileProps {
	loading: boolean;
	player: PlayerProps | null;
}

const initialState: ProfileProps = {
	loading: false,
	player: null,
};

const profileSlice = createSlice({
	name: 'profile',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(getPlayer.pending, (state) => {
			state.loading = true;
		});
		builder.addCase(getPlayer.fulfilled, (state, { payload: { result } }) => {
			state.loading = false;
			state.player = result;
		});
		builder.addCase(getPlayer.rejected, (state) => {
			state.loading = false;
		});
	},
});

export const {} = profileSlice.actions;
export default profileSlice.reducer;
