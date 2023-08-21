import { PayloadAction, createSlice } from "@reduxjs/toolkit";


type UserProps = {
  _id: string;
  username: string;
  email: string;
  password: string;
  profileProfile?: string;
  followers: string[];
  following: string[];
  description?: string;
  profilePicture?: string;
}

type UserState = {
  currentUser: UserProps | null;
  isLoading: boolean;
  error: Boolean;
}

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
    },
    loginSuccess: (state, action: PayloadAction<UserProps>) => {
      state.isLoading = false;
      state.currentUser = action.payload;
    },
    loginFailed: (state) => {
      state.isLoading = false;
      state.error = true;
    },
    logout: (state) => {
      return initialState;
    },
    changeProfile: (state, action: PayloadAction<string>) => {
      if(state.currentUser){
        state.currentUser.profilePicture = action.payload;
      }
    },
    following: (state, action: PayloadAction<string>) => {
      if(state.currentUser){
        if (state.currentUser.following.includes(action.payload)) {
          state.currentUser.following.splice(
            state.currentUser.following.findIndex(
              (followingId) => followingId === action.payload
            )
          );
        } else {
          state.currentUser.following.push(action.payload);
        }
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailed,
  logout,
  changeProfile,
  following,
} = userSlice.actions;

export default userSlice.reducer;
