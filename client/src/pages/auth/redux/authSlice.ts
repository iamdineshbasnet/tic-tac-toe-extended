import { createSlice } from "@reduxjs/toolkit"
import { createGuest } from "./thunk";
import setCookie from "@/utils/cookies/setCookie";


interface AuthProps{
  loadingGuestRegistration: boolean;
}

const initialState: AuthProps = {
  loadingGuestRegistration: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder)=>{
    builder.addCase(createGuest.pending, (state)=>{
      state.loadingGuestRegistration = true
    })
    builder.addCase(createGuest.fulfilled, (state, { payload: { accessToken, refreshToken }})=>{
      state.loadingGuestRegistration = false

      if(!(accessToken && refreshToken)) return;

      setCookie("accessToken", accessToken, {
        secure: true,
        'max-age': 86400, // a day
        sameSite: 'lax'
      })

      setCookie("refreshToken", refreshToken, {
        secure: true,
        'max-age': 86400 * 7, // 7 day
        sameSite: 'lax'
      })
    })
    builder.addCase(createGuest.rejected, (state)=>{
      state.loadingGuestRegistration = false
    })
  }
})

// export actions
export const {} = authSlice.actions

export default authSlice.reducer