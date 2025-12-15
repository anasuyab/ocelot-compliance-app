import React, { useState, useEffect, useRef } from 'react';
import { Loader, CheckCircle, AlertCircle, MousePointer2, ChevronRight, Maximize2 } from 'lucide-react';
import { getRoomStyle } from '../../utils/roomStyles'; // Import the helper we made

// Mock Data representing "AI Detected" rooms
// In a real app, these coordinates (x, y, width, height) come from your Python backend
const MOCK_DETECTED_ROOMS = [
  { id: 1, label: 'Gymnasium', type: 'Gymnasium', x: 55, y: 15, w: 40, h: 60 },
  { id: 2, label: 'Lobby', type: 'Circulation', x: 30, y: 65, w: 20, h: 25 },
  { id: 3, label: 'Office 101', type: 'Office', x: 5, y: 35, w: 15, h: 20 },
  { id: 4, label: 'Restrooms', type: 'Restroom', x: 5, y: 10, w: 15, h: 15 },
  { id: 5, label: 'Lounge', type: 'Assembly', x: 30, y: 35, w: 15, h: 15 },
];

const ROOM_TYPES = ['Office', 'Circulation', 'Assembly', 'Support', 'Restroom', 'Gymnasium'];

// 1. Update the component arguments to accept 'status'
const AnalysisView = ({ theme, progress, status, uploadedFile, onAnalysisComplete }) => {
  
  // ... state definitions ...

  // 2. Update the useEffect logic
  // logic: If progress finishes OR status says we are done, switch to review mode.
  useEffect(() => {
    if ((progress >= 100 || status === 'complete') && !isReviewMode) {
      setRooms(MOCK_DETECTED_ROOMS);
      // Small timeout to let the user register the success before UI shifts
      setTimeout(() => setIsReviewMode(true), 500); 
    }
  }, [progress, status, isReviewMode]);

  // Handle Room Type Correction
  const handleTypeChange = (roomId, newType) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, type: newType } : room
    ));
  };

  // --- RENDER: LOADING STATE (Before 100%) ---
  if (!isReviewMode) {
    return (
      <div className="max-w-2xl mx-auto text-center pt-12">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <Loader className={`w-24 h-24 ${theme.loaderIcon} animate-spin`} />
        </div>
        <h2 className={`text-2xl font-bold ${theme.textPrimary} mb-2`}>Analyzing Blueprint</h2>
        <p className={`${theme.textSecondary} mb-6`}>Detecting walls, identifying room types, and measuring areas...</p>
        <div className={`w-full ${theme.progressBar} rounded-full h-3 mb-4`}>
          <div className={`${theme.progressFill} h-3 rounded-full transition-all duration-300`} style={{ width: `${progress}%` }}></div>
        </div>
        <p className={`text-sm ${theme.textSecondary}`}>{progress}% Complete</p>
      </div>
    );
  }

  // --- RENDER: INTERACTIVE REVIEW STATE (Split Pane) ---
  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6 animate-fade-in">
      
      {/* --- LEFT PANEL: INTERACTIVE BLUEPRINT --- */}
      <div className="flex-1 bg-slate-100 rounded-xl border border-slate-300 overflow-hidden relative shadow-inner flex flex-col">
        
        {/* Toolbar */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MousePointer2 className="w-4 h-4" />
            <span>Click regions to verify room types</span>
          </div>
          <button className="text-slate-500 hover:text-slate-800"><Maximize2 className="w-4 h-4" /></button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-auto p-4 flex items-center justify-center bg-slate-50" ref={imageContainerRef}>
          <div className="relative shadow-2xl inline-block">
            {/* The Uploaded Image */}
            <img 
              src={uploadedFile ? URL.createObjectURL(uploadedFile) : "/api/placeholder/800/600"} 
              alt="Blueprint Analysis" 
              className="max-w-full max-h-[600px] object-contain block"
            />

            {/* SVG Overlay Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {rooms.map((room) => {
                const style = getRoomStyle(room.type, selectedRoomId === room.id);
                return (
                  <rect
                    key={room.id}
                    x={`${room.x}%`}
                    y={`${room.y}%`}
                    width={`${room.w}%`}
                    height={`${room.h}%`}
                    fill={style.fill}
                    stroke={style.stroke}
                    strokeWidth={style.strokeWidth}
                    className="pointer-events-auto hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedRoomId(room.id)}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: DATA & CORRECTIONS --- */}
      <div className="w-80 flex flex-col gap-4">
        
        {/* Status Card */}
        <div className={`${theme.cardBackground} rounded-xl p-6 shadow-sm border ${theme.cardBorder}`}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-lg">Analysis Complete</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            We identified <strong>{rooms.length} rooms</strong>. Please review and correct any misidentified areas before generating the report.
          </p>
          <button 
            onClick={() => onAnalysisComplete(rooms)} // Pass corrected data up to App
            className={`w-full ${theme.primaryButton} ${theme.primaryButtonText} py-3 rounded-lg font-medium flex items-center justify-center gap-2`}
          >
            Generate Final Report
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Card */}
        <div className={`${theme.cardBackground} rounded-xl p-0 shadow-sm border ${theme.cardBorder} flex-1 overflow-hidden flex flex-col`}>
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h4 className="font-semibold text-slate-800">Room Details</h4>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            {selectedRoom ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Selected Room</label>
                  <div className="text-xl font-bold text-slate-900">{selectedRoom.label}</div>
                  <div className="text-sm text-slate-500">ID: #{selectedRoom.id}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Room Type</label>
                  <div className="space-y-2">
                    {ROOM_TYPES.map(type => (
                      <label 
                        key={type}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedRoom.type === type 
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="roomType"
                          className="w-4 h-4 text-blue-600"
                          checked={selectedRoom.type === type}
                          onChange={() => handleTypeChange(selectedRoom.id, type)}
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getRoomStyle(type).border }}></div>
                          <span className="text-sm font-medium text-slate-700">{type}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                <MousePointer2 className="w-12 h-12 mb-3 opacity-20" />
                <p>Select a highlighted region on the blueprint to edit its details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;