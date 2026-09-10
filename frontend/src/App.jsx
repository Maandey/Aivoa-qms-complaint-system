import React from 'react';
import Navbar from './components/Navbar';
import ComplaintForm from './components/ComplaintForm';
import AIAssistant from './components/AIAssistant';
import PasteTextModal from './components/PasteTextModal';
import SampleDocsModal from './components/SampleDocsModal';
import ComplaintHistoryModal from './components/ComplaintHistoryModal';
import SettingsModal from './components/SettingsModal';

export default function App() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased">
      {/* Top Header Navigation */}
      <Navbar />

      {/* Main Split Layout matching Reference UI Screenshot */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
          
          {/* Left Column: Log Customer Complaint Form (7 cols on desktop) */}
          <div className="lg:col-span-7 h-[calc(100vh-6.5rem)] min-h-[700px]">
            <ComplaintForm />
          </div>

          {/* Right Column: AI Complaint Intake Assistant / AIVOA Co-pilot (5 cols on desktop) */}
          <div className="lg:col-span-5 h-[calc(100vh-6.5rem)] min-h-[700px]">
            <AIAssistant />
          </div>

        </div>
      </main>

      {/* Modals & Overlays */}
      <PasteTextModal />
      <SampleDocsModal />
      <ComplaintHistoryModal />
      <SettingsModal />
    </div>
  );
}
