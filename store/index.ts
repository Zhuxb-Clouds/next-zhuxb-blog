import { configureStore } from '@reduxjs/toolkit'
import darkSlice from './darkSlice'


const store = configureStore({
  reducer: {
    dark: darkSlice
  }
})

export default store