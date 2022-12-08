import { createSlice } from '@reduxjs/toolkit'
interface Html {
  setAttribute: Function;
}

const darkSlice = createSlice({
  name: 'dark',
  initialState: {
    value: "auto",
    html: <Html>{},
    sysMode: false
  },
  reducers: {
    setAuto: state => {
      state.html.setAttribute("mode", state.sysMode ? "dark" : "light");
      state.value = 'auto'
    },
    setLight: state => {
      state.html.setAttribute("mode", "light");
      state.value = 'light'
    },
    setDark: state => {
      state.html.setAttribute("mode", "dark");

      state.value = 'dark'
    },
    setEnv: (state, { payload }) => {
      state.html = payload.document.documentElement
      state.sysMode = payload.window.matchMedia("(prefers-color-scheme: dark)").matches
    }
  }
})
export const { setAuto, setLight, setDark, setEnv } = darkSlice.actions

export default darkSlice.reducer

