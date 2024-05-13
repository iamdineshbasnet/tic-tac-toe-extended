import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import {
    persistReducer,
    persistStore,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import roomReducer from '@/pages/room/redux/roomSlice';
import authReducer from "@/pages/auth/redux/authSlice";
import profileReducer from "@/pages/profile/redux/profileSlice";
const persistConfig = {
    key: "root",
    storage: storage,
    // store the reducer
    whitelist: ["auth"],
};

const rootReducer = combineReducers({
    room: roomReducer,
    auth: authReducer,
    profile: profileReducer,
});
//ensures your redux state is stored to persisted storage whenever it changes.
const persistedReducer = persistReducer(persistConfig, rootReducer);


const store = configureStore({
    reducer: persistedReducer,
    //  ignore all the action types it dispatches:
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: 
            {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }),
});
//store your redux reducers using redux persist
const persistor = persistStore(store);
export { store, persistor };

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
