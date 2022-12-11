import { createSlice } from '@reduxjs/toolkit'


const darkSlice = createSlice({
  name: 'dark',
  initialState: {
    value: "auto",
    html: <HTMLHtmlElement>{},
    sysMode: false
  },
  reducers: {
    setLight: state => {

      state.html.setAttribute("mode", "light");
      state.value = 'light'
    },
    setDark: state => {
      state.html.setAttribute("mode", "dark");
      state.value = 'dark'
    },
    setEnv: (state, { payload }) => {
      state.html = payload.window.document.documentElement
      state.sysMode = payload.window.matchMedia("(prefers-color-scheme: dark)").matches
      payload.window.document.documentElement.setAttribute("mode", state.sysMode ? "dark" : "light");
      state.value = state.sysMode ? 'dark' : 'light'
    }
  }
})
export const { setLight, setDark, setEnv } = darkSlice.actions

export default darkSlice.reducer

