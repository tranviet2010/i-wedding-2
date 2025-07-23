import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface Auth {
  openMenuDrawer: boolean;
}

const initialState: Auth = {
  openMenuDrawer: true,
};

const drawerSlice = createSlice({
  name: "drawer",
  initialState,
  reducers: {
    openMenuDrawer: (state) => {
      state.openMenuDrawer = true;
    },
    closeMenuDrawer: (state) => {
      state.openMenuDrawer = false;
    },
  },
});

export const { openMenuDrawer, closeMenuDrawer } = drawerSlice.actions;
export const selectOpenMenuDrawer = (state: RootState) =>
  state.drawer.openMenuDrawer;
export default drawerSlice.reducer;
