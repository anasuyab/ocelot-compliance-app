import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, Edit3, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const ReviewView = ({ theme, blueprintImage, initialRooms = [], onComplete, onReset }) => {
  // Local state for the interactive view
  const [rooms, setRooms] = useState(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [zoom, setZoom] = useState(1);

  // Sync props if initialRooms updates later
  useEffect(() => {
    if (initialRooms.length > 0) {
      setRooms(initialRooms);
    }
  }, [initialRooms]);

  const roomTypes = [
    { value: 'administrative', label: 'Administrative', color: 'rgba(251, 146, 60, 0.3)', border: 'border-orange-400' },
    { value: 'activity', label: 'Activity/Recreation', color: 'rgba(168, 85, 247, 0.3)', border: 'border-purple-400' },
    { value: 'common', label: 'Common Area', color: 'rgba(34, 197, 94, 0.3)', border: 'border-green-400' },
    { value: 'entrance', label: 'Entrance/Circulation', color: 'rgba(59, 130, 246, 0.3)', border: 'border-blue-400' },
    { value: 'service', label: 'Service/Support', color: 'rgba(239, 68, 68, 0.3)', border: 'border-red-400' }
  ];

  const handleRoomClick = (room) => setSelectedRoom(room);

  const handleRoomTypeChange = (newType) => {
    const typeInfo = roomTypes.find(t => t.value === newType);
    const updatedRooms = rooms.map(room => 
      room.id === selectedRoom.id 
        ? { ...room, type: newType, color: typeInfo.color }
        : room
    );
    setRooms(updatedRooms);
    setSelectedRoom(prev => ({ ...prev, type: newType, color: typeInfo.color }));
  };

  const handleRoomLabelChange = (newLabel) => {
    const updatedRooms = rooms.map(room => 
      room.id === selectedRoom.id ? { ...room, label: newLabel } : room
    );
    setRooms(updatedRooms);
    setSelectedRoom(prev => ({ ...prev, label: newLabel }));
  };

  const handleComplete = () => {
    // Pass the edited rooms back up to the parent to generate the final report
    onComplete(rooms);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
      
      {/* --- Left Panel: Controls & List --- */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
        
        {/* Legend */}
        <div className={`${theme.cardBackground} rounded-xl shadow-lg p-4 border ${theme.cardBorder}`}>
          <h3 className={`font-bold ${theme.textPrimary} mb-3`}>Room Types</h3>
          <div className="space-y-2">
            {roomTypes.map(type => (
              <div key={type.value} className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded border-2 ${type.border}`} style={{ backgroundColor: type.color }}></div>
                <span className="text-slate-700">{type.label}</span>
                <span className="text-slate-500 text-xs ml-auto">
                  {rooms.filter(r => r.type === type.value).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Room List */}
        <div className={`flex-1 ${theme.cardBackground} rounded-xl shadow-lg border ${theme.cardBorder} overflow-hidden flex flex-col`}>
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900">Detected Rooms ({rooms.length})</h3>
            <p className="text-xs text-slate-600 mt-1">Click a room to edit</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {rooms.map(room => {
              const typeInfo = roomTypes.find(t => t.value === room.type);
              return (
                <button
                  key={room.id}
                  onClick={() => handleRoomClick(room)}
                  className={`w-full p-3 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    selectedRoom?.id === room.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded border-2 ${typeInfo?.border}`} style={{ backgroundColor: room.color }}></div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">{room.label}</p>
                      <p className="text-xs text-slate-500">{typeInfo?.label}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor (Only visible when selected) */}
        {selectedRoom && (
          <div className={`${theme.cardBackground} rounded-xl shadow-lg p-4 border ${theme.cardBorder}`}>
             <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900">Edit Room</h3>
                <Edit3 className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
                  <input 
                    type="text"
                    value={selectedRoom.label}
                    onChange={(e) => handleRoomLabelChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Room Type</label>
                  <select 
                    value={selectedRoom.type}
                    onChange={(e) => handleRoomTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roomTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 mt-auto">
          <button 
            onClick={handleComplete}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Generate Report
          </button>
          <button 
            onClick={onReset}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Start Over
          </button>
        </div>
      </div>

      {/* --- Right Panel: Blueprint Viewer --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-900">Blueprint Review</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 hover:bg-slate-200 rounded-lg">
              <ZoomOut className="w-4 h-4 text-slate-600" />
            </button>
            <span className="text-sm text-slate-600 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 hover:bg-slate-200 rounded-lg">
              <ZoomIn className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-6 bg-slate-50 relative">
          <div className="relative inline-block origin-top-left transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
            {blueprintImage && (
              <>
                <img 
                  src={blueprintImage} 
                  alt="Blueprint" 
                  className="max-w-full h-auto rounded border border-slate-300"
                />
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ mixBlendMode: 'multiply' }}>
                  {rooms.map(room => {
                    const isSelected = selectedRoom?.id === room.id;
                    const typeInfo = roomTypes.find(t => t.value === room.type);
                    return (
                      <g key={room.id}>
                        <rect
                          x={room.bounds.x}
                          y={room.bounds.y}
                          width={room.bounds.width}
                          height={room.bounds.height}
                          fill={room.color}
                          stroke={isSelected ? '#3B82F6' : typeInfo?.border.replace('border-', '#').replace('-400', '')} // Simplified color parsing
                          strokeWidth={isSelected ? 3 : 2}
                          strokeDasharray={isSelected ? '5,5' : 'none'}
                          className="pointer-events-auto cursor-pointer transition-all hover:opacity-80"
                          onClick={() => handleRoomClick(room)}
                        />
                        <text
                          x={room.bounds.x + room.bounds.width / 2}
                          y={room.bounds.y + room.bounds.height / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="#1F2937"
                          fontSize="12"
                          fontWeight="600"
                          className="pointer-events-none select-none"
                        >
                          {room.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewView;