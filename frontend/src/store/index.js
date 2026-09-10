import { configureStore } from '@reduxjs/toolkit';
import complaintReducer from './complaintSlice';
import chatReducer from './chatSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    complaint: complaintReducer,
    chat: chatReducer,
    settings: settingsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
