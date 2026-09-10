import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  apiKey: localStorage.getItem('aivoa_groq_api_key') || '',
  selectedModel: localStorage.getItem('aivoa_groq_model') || 'gemma2-9b-it',
  autoRiskAnalysis: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setApiKey: (state, action) => {
      state.apiKey = action.payload;
      localStorage.setItem('aivoa_groq_api_key', action.payload);
    },
    setSelectedModel: (state, action) => {
      state.selectedModel = action.payload;
      localStorage.setItem('aivoa_groq_model', action.payload);
    },
    setAutoRiskAnalysis: (state, action) => {
      state.autoRiskAnalysis = action.payload;
    }
  }
});

export const { setApiKey, setSelectedModel, setAutoRiskAnalysis } = settingsSlice.actions;
export default settingsSlice.reducer;

