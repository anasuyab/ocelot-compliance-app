import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const AnnotatedView = ({ 
  theme, 
  blueprintImage, 
  roomsData, 
  coordinateBaseSize = { width: 1024, height: 1024 }, 
  onNext 
}) => {
  const referenceWidth = coordinateBaseSize.width;
  const referenceHeight = coordinateBaseSize.height;

  // --- Dynamic Styling Constants ---
  const fontSizeRoom = referenceWidth * 0.018;
  const fontSizeWall = referenceWidth * 0.012;
  const labelOffset = referenceWidth * 0.01;

  // --- State ---
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [colorMap, setColorMap] = useState({});
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(null); 

  const sidebarRefs = useRef({}); 

  // --- Styles ---
  const textStyle = {
    fill: "black",
    fontWeight: "600",
    textAnchor: "middle",
    pointerEvents: "none",
    paintOrder: "stroke",
    stroke: "white",
    strokeWidth: referenceWidth * 0.002, 
    strokeLinejoin: "round"
  };

  const colorPalette = [
    'rgba(100, 149, 237, 0.4)', 'rgba(255, 99, 71, 0.4)', 'rgba(147, 112, 219, 0.4)',
    'rgba(255, 165, 0, 0.4)', 'rgba(135, 206, 250, 0.4)', 'rgba(255, 192, 203, 0.4)',
    'rgba(240, 230, 140, 0.4)', 'rgba(211, 211, 211, 0.4)', 'rgba(144, 238, 144, 0.4)',
    'rgba(255, 218, 185, 0.4)', 'rgba(176, 196, 222, 0.4)', 'rgba(255, 160, 122, 0.4)',
  ];

  // --- Effects ---
  useEffect(() => {
    if (roomsData && roomsData.length > 0) {
      const uniqueTypes = [...new Set(roomsData.map(r => r.type?.toLowerCase()))];
      const newColorMap = {};
      uniqueTypes.forEach((type, index) => {
        newColorMap[type] = colorPalette[index % colorPalette.length];
      });
      setColorMap(newColorMap);
    }
  }, [roomsData]);

  useEffect(() => {
    if (selectedRoomIndex !== null && sidebarRefs.current[selectedRoomIndex]) {
      sidebarRefs.current[selectedRoomIndex].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [selectedRoomIndex]);

  // --- Helper Functions ---
  const handleRoomClick = (index) => {
    setSelectedRoomIndex(prev => (prev === index ? null : index));
  };

  const getRoomGeometry = (room) => {
    // Debug: Log if geometry is missing to help identify why rooms aren't drawing
    const shapeType = room.shape_type || room.type;
    
    if ((shapeType === 'rect' || room.coords?.x !== undefined) && room.coords) {
      return {
        type: 'rect',
        x: room.coords.x, y: room.coords.y, width: room.coords.w, height: room.coords.h,
        centerX: room.coords.x + room.coords.w / 2, centerY: room.coords.y + room.coords.h / 2
      };
    }
    
    if ((shapeType === 'polygon' || room.points) && room.points) {
      const centerX = room.points.reduce((sum, p) => sum + p[0], 0) / room.points.length;
      const centerY = room.points.reduce((sum, p) => sum + p[1], 0) / room.points.length;
      return { type: 'polygon', points: room.points, centerX, centerY };
    }

    if ((shapeType === 'circle' || room.coords?.cx !== undefined) && room.coords) {
      return {
        type: 'circle',
        cx: room.coords.cx, cy: room.coords.cy, r: room.coords.r,
        centerX: room.coords.cx, centerY: room.coords.cy
      };
    }
    
    console.warn("AnnotatedView: Skipped room due to missing geometry", room);
    return null;
  };

  const getWallLabelPosition = (room, wall, geometry) => {
    if (!geometry || !room.walls) return null;
    const wallIndex = wall.sequence_order - 1;
    if (geometry.type === 'rect') {
      const positions = [
        { x: geometry.centerX, y: geometry.y - labelOffset, anchor: 'middle' },
        { x: geometry.x + geometry.width + labelOffset, y: geometry.centerY, anchor: 'start' },
        { x: geometry.centerX, y: geometry.y + geometry.height + (labelOffset * 1.5), anchor: 'middle' },
        { x: geometry.x - labelOffset, y: geometry.centerY, anchor: 'end' }
      ];
      return positions[wallIndex % 4];
    }
    if (geometry.type === 'polygon' && geometry.points) {
      const points = geometry.points;
      const nextIndex = (wallIndex + 1) % points.length;
      const p1 = points[wallIndex]; const p2 = points[nextIndex];
      if (p1 && p2) {
        const midX = (p1[0] + p2[0]) / 2; const midY = (p1[1] + p2[1]) / 2;
        const dx = p2[0] - p1[0]; const dy = p2[1] - p1[1];
        const length = Math.sqrt(dx * dx + dy * dy);
        const offsetX = -(dy / length) * labelOffset; const offsetY = (dx / length) * labelOffset;
        return { x: midX + offsetX, y: midY + offsetY, anchor: 'middle' };
      }
    }
    return null;
  };

  const handleZoomIn = () => setViewTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5) }));
  const handleZoomOut = () => setViewTransform(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.5) }));
  const handleReset = () => setViewTransform({ x: 0, y: 0, scale: 1 });

  return (
    <div className={`flex h-screen font-sans ${theme.pageBackground}`}>
      
      {/* --- Sidebar --- */}
      <div 
        style={{ width: '340px', padding: '20px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: '15px', zIndex: 10, overflowY: 'auto' }} 
        className={`${theme.cardBackground} ${theme.cardBorder}`}
      >
        <h3 className={`m-0 mb-2 border-b-2 pb-2 ${theme.textPrimary}`} style={{borderColor: '#eee'}}>Detected Rooms</h3>
        
        <div className="flex gap-2 mb-2">
          <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${theme.primaryButton} ${theme.primaryButtonText}`} onClick={handleZoomIn}><ZoomIn size={16} /> In</button>
          <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${theme.primaryButton} ${theme.primaryButtonText}`} onClick={handleZoomOut}><ZoomOut size={16} /> Out</button>
          <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${theme.primaryButton} ${theme.primaryButtonText}`} onClick={handleReset}><RotateCcw size={16} /> Reset</button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {roomsData?.map((room, idx) => {
            const isSelected = selectedRoomIndex === idx;
            const roomColor = colorMap[room.type?.toLowerCase()] || '#ccc';
            
            return (
               <div 
                 key={idx}
                 ref={el => sidebarRefs.current[idx] = el}
                 onClick={() => handleRoomClick(idx)}
                 className={`mb-3 p-3 rounded border transition-all duration-200 cursor-pointer ${theme.cardBackground}`} 
                 style={{
                   backgroundColor: isSelected ? '#e3f2fd' : '#f8f9fa', 
                   borderColor: isSelected ? '#2196f3' : '#e9ecef',
                   borderLeft: `5px solid ${roomColor.replace('0.4', '1')}`,
                   boxShadow: isSelected ? '0 2px 8px rgba(33, 150, 243, 0.2)' : 'none'
                 }}
               >
                  <div className="flex justify-between items-start mb-2">
                    <strong className={`text-sm ${theme.textPrimary}`}>{room.name}</strong>
                    <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded text-gray-700">
                      {room.calculated_area?.toLocaleString()} sq ft
                    </span>
                  </div>
                  {room.walls && (
                    <div className="mt-2 pt-2 border-t border-gray-200/50">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Dimensions (Walls):</div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {room.walls.map((wall, wIdx) => (
                          <div key={wIdx} className="text-xs text-gray-600 flex justify-between">
                            <span>W{wall.sequence_order}:</span>
                            <span className="font-medium text-gray-800">{wall.length}{wall.unit || "'"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
            );
          })}
        </div>
        <button className={`mt-auto px-4 py-3 rounded font-semibold text-base ${theme.primaryButton} ${theme.primaryButtonText}`} onClick={onNext}>Generate Report →</button>
      </div>

      {/* --- Canvas --- */}
      <div className="flex-1 relative overflow-hidden flex justify-center items-center" style={{background: '#333'}}>
        <div style={{ position: 'relative', display: 'inline-flex', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
          <img 
            src={blueprintImage} 
            alt="Blueprint" 
            style={{ display: 'block', maxWidth: '100%', maxHeight: '90vh', pointerEvents: 'none' }} 
          />
          
          {roomsData && (
            <svg 
              viewBox={`0 0 ${referenceWidth} ${referenceHeight}`}
              // FIX: preserveAspectRatio="none" is CRITICAL.
              // It forces the coordinate system to stretch and match the image dimensions exactly.
              preserveAspectRatio="none"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <g transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`}>
                
                {/* 1. DRAW SHAPES */}
                {roomsData.map((room, idx) => {
                  const geometry = getRoomGeometry(room);
                  if (!geometry) return null;
                  
                  const isSelected = selectedRoomIndex === idx;
                  const roomColor = colorMap[room.type?.toLowerCase()] || 'rgba(128, 128, 128, 0.4)';
                  const strokeColor = isSelected ? '#2196f3' : '#333';
                  const strokeWidth = isSelected ? referenceWidth * 0.004 : referenceWidth * 0.001;
                  const fillOpacity = isSelected ? 0.7 : 1;

                  const shapeProps = {
                    fill: roomColor,
                    stroke: strokeColor,
                    strokeWidth: strokeWidth,
                    style: { 
                      cursor: 'pointer', 
                      pointerEvents: 'all', 
                      transition: 'stroke-width 0.2s, fill-opacity 0.2s',
                      fillOpacity: fillOpacity
                    },
                    onClick: (e) => {
                      e.stopPropagation();
                      handleRoomClick(idx);
                    }
                  };

                  return (
                    <g key={`shape-${idx}`}>
                      {geometry.type === 'rect' && <rect x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} {...shapeProps} />}
                      {geometry.type === 'polygon' && <polygon points={geometry.points.map(p => p.join(',')).join(' ')} {...shapeProps} />}
                      {geometry.type === 'circle' && <circle cx={geometry.cx} cy={geometry.cy} r={geometry.r} {...shapeProps} />}
                    </g>
                  );
                })}

                {/* 2. DRAW TEXT */}
                {roomsData.map((room, idx) => {
                  const geometry = getRoomGeometry(room);
                  if (!geometry) return null;

                  return (
                    <g key={`text-${idx}`} style={{ pointerEvents: 'none' }}>
                      <text x={geometry.centerX} y={geometry.centerY - (fontSizeRoom * 0.6)} fontSize={fontSizeRoom} style={textStyle}>
                        {room.name}
                      </text>
                      <text x={geometry.centerX} y={geometry.centerY + (fontSizeRoom * 0.7)} fontSize={fontSizeRoom * 0.8} style={textStyle}>
                        {room.calculated_area?.toLocaleString()} sq ft
                      </text>
                      {room.walls && room.walls.map((wall, wIdx) => {
                        const labelPos = getWallLabelPosition(room, wall, geometry);
                        if (!labelPos) return null;
                        return (
                          <text key={wIdx} x={labelPos.x} y={labelPos.y} textAnchor={labelPos.anchor} fontSize={fontSizeWall} style={textStyle}>
                            {wall.length}'
                          </text>
                        );
                      })}
                    </g>
                  );
                })}

              </g>
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnotatedView;
