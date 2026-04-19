import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    isDarkMode: true,
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
  },
});

export const { toggleTheme, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
