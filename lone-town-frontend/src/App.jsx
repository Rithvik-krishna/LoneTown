import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainRouter from "./pages/MainRouter"; // ✅ CORRECT

export default function App() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-gray-200 font-sans">
      <BrowserRouter>
        <MainRouter />
      </BrowserRouter>
    </div>
  );
}
