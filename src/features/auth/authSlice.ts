
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';

export interface Auth {
  userId: number;
  walletAddress: string;
  avatar: string;
  accessToken: string;
  refreshToken: string;
  signature: string;
  wallet: string;
  signMessage: string;
  username: string;
  email: string;
}

interface AuthState {
  auth: Auth | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  auth: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<Auth>) => {
      state.auth = {...state.auth, ...action.payload};
    },
    signOut: (state) => {
      state.auth = null;
    },
    setWallet: (state, action: PayloadAction<string | null>) => ({
      ...state,
      wallet: action.payload
    }),
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setNonce: (state, action: PayloadAction<string>) => ({
      ...state,
      signMessage: action.payload
    })
  },
  
});

export const { signIn, signOut, setWallet, setNonce } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth.auth;
export const selectLoading = (state: RootState) => state.auth.loading;
export const selectError = (state: RootState) => state.auth.error;
export default  authSlice.reducer;