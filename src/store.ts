import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import drawerReducer from './features/drawer/drawerSlice';
import storage from 'redux-persist/lib/storage'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'drawer']
};

const persistedReducer = persistReducer(persistConfig, authReducer);
const persistedDrawerReducer = persistReducer(persistConfig, drawerReducer);

const store = configureStore({
  reducer: {
    auth: persistedReducer,
    drawer: persistedDrawerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;