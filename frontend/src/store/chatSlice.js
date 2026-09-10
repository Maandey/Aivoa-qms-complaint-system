import { createSlice } from '@reduxjs/toolkit';

const initialWelcomeMessage = {
  id: 'welcome-msg',
  sender: 'assistant',
  text: 'Upload a complaint document or paste text above. I will automatically extract the details and populate the form for you.',
  timestamp: new Date().toISOString(),
  tool_used: 'system'
};

const initialState = {
  messages: [initialWelcomeMessage],
  isProcessing: false,
  extractionProgress: 0,
  extractionStatusMessage: '',
  isPasteModalOpen: false,
  isRegistryOpen: false,
  isSettingsOpen: false,
  isSampleDocsOpen: false,
  activeLeftTab: 'form', // 'form' | 'risk' | 'capa' | 'history'
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push({
        id: `msg-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        ...action.payload
      });
    },
    setIsProcessing: (state, action) => {
      state.isProcessing = action.payload;
    },
    setExtractionProgress: (state, action) => {
      const { progress, message } = action.payload;
      state.extractionProgress = progress;
      if (message !== undefined) {
        state.extractionStatusMessage = message;
      }
    },
    resetProgress: (state) => {
      state.extractionProgress = 0;
      state.extractionStatusMessage = '';
    },
    setPasteModalOpen: (state, action) => {
      state.isPasteModalOpen = action.payload;
    },
    setRegistryOpen: (state, action) => {
      state.isRegistryOpen = action.payload;
    },
    setSettingsOpen: (state, action) => {
      state.isSettingsOpen = action.payload;
    },
    setSampleDocsOpen: (state, action) => {
      state.isSampleDocsOpen = action.payload;
    },
    setActiveLeftTab: (state, action) => {
      state.activeLeftTab = action.payload;
    },
    clearChat: (state) => {
      state.messages = [initialWelcomeMessage];
      state.extractionProgress = 0;
      state.extractionStatusMessage = '';
    }
  }
});

export const {
  addMessage,
  setIsProcessing,
  setExtractionProgress,
  resetProgress,
  setPasteModalOpen,
  setRegistryOpen,
  setSettingsOpen,
  setSampleDocsOpen,
  setActiveLeftTab,
  clearChat
} = chatSlice.actions;

export default chatSlice.reducer;
