import { createSlice } from '@reduxjs/toolkit';
import { deletePlayer, getPlayer, updatePlayer } from './thunk';
import deleteCookie from '@/utils/cookies/deleteCookie';

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
	loadingUpdatePlayer: boolean;
	loadingDeletePlayer: boolean;
}

const initialState: ProfileProps = {
	loading: false,
	player: null,
	loadingUpdatePlayer: false,
	loadingDeletePlayer: false,
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
		builder.addCase(updatePlayer.pending, (state)=>{
			state.loadingUpdatePlayer = true
		})
		builder.addCase(updatePlayer.fulfilled, (state, { payload: { result }})=>{
			state.loadingUpdatePlayer = false
			state.player = result
		})
		builder.addCase(updatePlayer.rejected, (state)=>{
			state.loadingUpdatePlayer = false
		})
		builder.addCase(deletePlayer.pending, (state)=>{
			state.loadingDeletePlayer = true
		})
		builder.addCase(deletePlayer.fulfilled, (state)=>{
			state.player = null
			state.loadingDeletePlayer = false
			deleteCookie('accessToken')
			deleteCookie('refreshToken')
		})
		builder.addCase(deletePlayer.rejected, (state)=>{
			state.loadingDeletePlayer = false
		})
	},
});

export const {} = profileSlice.actions;
export default profileSlice.reducer;
