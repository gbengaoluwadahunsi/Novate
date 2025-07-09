"use client"

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/authSlice'
import notesReducer from './features/notesSlice'
import userReducer from './features/userSlice'

// Ensure we're on the client side before creating the store
let store: ReturnType<typeof configureStore> | undefined

export const createStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      notes: notesReducer,
      user: userReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// Create store only on client side
if (typeof window !== 'undefined' && !store) {
  store = createStore()
}

// Fallback for server-side rendering
export const getStore = () => {
  if (!store) {
    store = createStore()
  }
  return store
}

export { store }

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>
export type AppDispatch = ReturnType<typeof createStore>['dispatch']
