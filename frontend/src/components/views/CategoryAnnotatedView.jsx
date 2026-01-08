import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ChevronDown, ChevronRight, Eye } from 'lucide-react';

// --- 1. DEFINE CONSTANTS ---
const CAT_PFSA = "PFSA Space";
const CAT_NON_QUALIFIED = "Non Qualified Space";
const CAT_COMMON = "Common Space";
const CAT_SHARED = "Shared Space";
const CAT_UNKNOWN = "Unknown";

const CATEGORY_COLORS = {
  [CAT_PFSA]: "rgba(59, 130, 246, 0.6)",          // Blue
  [CAT_NON_QUALIFIED]: "rgba(16, 185, 129, 0.6)", // Green
  [CAT_COMMON]: "rgba(245, 158, 11, 0.6)",        // Amber/Orange
  [CAT_SHARED]: "rgba(139, 92, 246, 0.6)",        // Purple
  [CAT_UNKNOWN]: "rgba(156, 163, 175, 0.6)"       // Grey
};

const CategoryAnnotatedView = ({ 
  theme, 
  blueprintImage, 
  roomsData, 
  categorySummary, 
  fileName,
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
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(null);
  const [highlightedCategory, setHighlightedCategory] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const sidebarRefs = useRef({}); 

  // --- Styles ---
  const textStyle = {
    fill: "black",
    fontWeight: "700",
    textAnchor: "middle",
    pointerEvents: "none",
    paintOrder: "stroke",
    stroke: "white",
    strokeWidth: referenceWidth * 0.003, 
    strokeLinejoin: "round",
    fontFamily: "sans-serif"
  };

  // --- Group Rooms by Category ---
  const roomsByCategory = useMemo(() => {
    const grouped = {
      [CAT_PFSA]: [],
      [CAT_NON_QUALIFIED]: [],
      [CAT_COMMON]: [],
      [CAT_SHARED]: [],
      [CAT_UNKNOWN]: []
    };
    
    if (roomsData) {
      roomsData.forEach((room, index) => {
        const cat = room.category || CAT_UNKNOWN;
        const targetGroup = grouped[cat] ? cat : CAT_UNKNOWN;
        grouped[targetGroup].push({ ...room, originalIndex: index });
      });
    }
    return grouped;
  }, [roomsData]);

  // --- Effects ---
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

  const toggleCategoryHighlight = (cat) => {
    setHighlightedCategory(prev => (prev === cat ? null : cat));
  };

  const toggleCategoryCollapse = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const getCategoryColor = (category) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS[CAT_UNKNOWN];
  };

  const getCategoryTotal = (cat) => {
    if (!categorySummary || !categorySummary.totals_sq_ft) return 0;
    return categorySummary.totals_sq_ft[cat] || 0;
  };

  // --- Geometry Helpers ---
  const getRoomGeometry = (room) => {
    const shapeType = room.shape_type || room.type;
    if ((shapeType === 'rect' || room.coords?.x !== undefined) && room.coords) {
      return { type: 'rect', x: room.coords.x, y: room.coords.y, width: room.coords.w, height: room.coords.h, centerX: room.coords.x + room.coords.w / 2, centerY: room.coords.y + room.coords.h / 2 };
    }
    if ((shapeType === 'polygon' || room.points) && room.points) {
      const centerX = room.points.reduce((sum, p) => sum + p[0], 0) / room.points.length;
      const centerY = room.points.reduce((sum, p) => sum + p[1], 0) / room.points.length;
      return { type: 'polygon', points: room.points, centerX, centerY };
    }
    if ((shapeType === 'circle' || room.coords?.cx !== undefined) && room.coords) {
      return { type: 'circle', cx: room.coords.cx, cy: room.coords.cy, r: room.coords.r, centerX: room.coords.cx, centerY: room.coords.cy };
    }
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
      
      {/* --- SIDEBAR --- */}
      <div 
        style={{ width: '380px', padding: '0', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', zIndex: 10, background: '#fff' }} 
        className={`${theme.cardBackground} ${theme.cardBorder}`}
      >
        <div className="p-4 border-b border-gray-200">
           <h3 className={`m-0 text-lg font-bold ${theme.textPrimary}`}>Detected Rooms</h3>
           <p className="text-sm text-gray-500 mb-3 truncate" title={fileName}>
             {fileName}
           </p>
           
           <div className="flex gap-2">
            <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium ${theme.primaryButton} ${theme.primaryButtonText}`} onClick={handleZoomIn}><ZoomIn size={14} /> In</button>
            <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium ${theme.primaryButton} ${theme.primaryButtonText}`} onClick={handleZoomOut}><ZoomOut size={14} /> Out</button>
            <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium ${theme.primaryButton} ${theme.primaryButtonText}`} onClick={handleReset}><RotateCcw size={14} /> Reset</button>
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(roomsByCategory).map(([category, rooms]) => {
             if (rooms.length === 0) return null;
             const isCollapsed = collapsedCategories[category];

             return (
               <div key={category} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                 <div 
                    onClick={() => toggleCategoryCollapse(category)}
                    className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer border-b border-gray-100 hover:bg-gray-100 transition-colors"
                 >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      <span className="font-semibold text-sm text-gray-700">{category}</span>
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">{rooms.length}</span>
                    </div>
                 </div>

                 {!isCollapsed && (
                   <div className="divide-y divide-gray-100">
                     {rooms.map((room) => {
                       const idx = room.originalIndex;
                       const isSelected = selectedRoomIndex === idx;
                       const roomColor = getCategoryColor(room.category);

                       return (
                         <div 
                           key={idx}
                           ref={el => sidebarRefs.current[idx] = el}
                           onClick={() => handleRoomClick(idx)}
                           className={`p-3 transition-all duration-200 cursor-pointer border-l-4 hover:bg-gray-50`}
                           style={{
                             backgroundColor: isSelected ? '#f0f9ff' : 'white',
                             borderLeftColor: roomColor.replace('0.6', '1')
                           }}
                         >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm text-gray-800">{room.name}</span>
                              <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">
                                {room.calculated_area?.toLocaleString()} ft²
                              </span>
                            </div>
                            
                            {room.walls && (
                              <div className="grid grid-cols-3 gap-1 mt-2">
                                {room.walls.map((wall, wIdx) => (
                                  <div key={wIdx} className="text-[10px] text-gray-500 bg-gray-50 px-1 rounded flex justify-between">
                                    <span>W{wall.sequence_order}:</span>
                                    <span className="font-medium text-gray-700">{wall.length}'</span>
                                  </div>
                                ))}
                              </div>
                            )}
                         </div>
                       );
                     })}
                   </div>
                 )}
               </div>
             );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button className={`w-full py-3 rounded font-semibold shadow-sm ${theme.primaryButton} ${theme.primaryButtonText}`} onClick={onNext}>
            Generate Final Report →
          </button>
        </div>
      </div>

      {/* --- CANVAS --- */}
      <div className="flex-1 relative overflow-hidden flex justify-center items-center bg-gray-900">
        
        {/* --- PROMINENT TOP LEGEND WITH FILENAME --- */}
        <div className="absolute top-6 z-20 flex justify-center w-full px-8 pointer-events-none">
           <div className="flex flex-col items-center">
             
             {/* Filename Badge */}
             <div className="mb-2 px-4 py-1.5 bg-gray-900/80 backdrop-blur-sm rounded-full text-white text-lg font-medium shadow-lg pointer-events-auto border border-white/10">
               {fileName}
             </div>

             {/* Legend Pill */}
             <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-gray-200 flex gap-6 pointer-events-auto">
               {Object.keys(CATEGORY_COLORS).map(cat => {
                 if (getCategoryTotal(cat) === 0) return null; 
                 const isActive = highlightedCategory === cat;
                 const isDimmed = highlightedCategory && !isActive;

                 return (
                   <div 
                     key={cat} 
                     onClick={() => toggleCategoryHighlight(cat)}
                     className={`flex flex-col items-center cursor-pointer transition-all duration-200 px-2 py-1 rounded-lg ${
                       isActive ? 'bg-gray-100 scale-105 ring-2 ring-blue-500/20' : ''
                     } ${isDimmed ? 'opacity-40 hover:opacity-100' : 'hover:bg-gray-50'}`}
                   >
                      <div className="flex items-center gap-2 mb-1">
                         <div 
                           className="w-4 h-4 rounded-full shadow-sm" 
                           style={{ backgroundColor: CATEGORY_COLORS[cat].replace('0.6', '1') }}
                         />
                         <span className="font-bold text-gray-800 text-sm">{cat}</span>
                      </div>
                      <span className="text-xs text-gray-600 font-mono font-medium">
                        {getCategoryTotal(cat).toLocaleString()} ft²
                      </span>
                   </div>
                 );
               })}
             </div>
           </div>
        </div>

        <div style={{ position: 'relative', display: 'inline-flex', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
          <img 
            src={blueprintImage} 
            alt="Blueprint" 
            style={{ display: 'block', maxWidth: '100%', maxHeight: '90vh', pointerEvents: 'none', filter: highlightedCategory ? 'grayscale(50%)' : 'none', transition: 'filter 0.3s' }} 
          />
          
          {roomsData && (
            <svg 
              viewBox={`0 0 ${referenceWidth} ${referenceHeight}`}
              preserveAspectRatio="none"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <g transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`}>
                
                {/* 1. DRAW SHAPES */}
                {roomsData.map((room, idx) => {
                  const geometry = getRoomGeometry(room);
                  if (!geometry) return null;
                  
                  const isSelected = selectedRoomIndex === idx;
                  const isHighlighted = !highlightedCategory || room.category === highlightedCategory;
                  
                  const roomColor = getCategoryColor(room.category);
                  const strokeColor = isSelected ? '#fff' : (isHighlighted ? '#333' : '#999');
                  const strokeWidth = isSelected ? referenceWidth * 0.005 : referenceWidth * 0.001;
                  const fillOpacity = isHighlighted ? (isSelected ? 0.8 : 0.5) : 0.1;

                  const shapeProps = {
                    fill: roomColor,
                    stroke: strokeColor,
                    strokeWidth: strokeWidth,
                    style: { 
                      cursor: 'pointer', 
                      pointerEvents: 'all', 
                      transition: 'all 0.3s ease',
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

                  const isHighlighted = !highlightedCategory || room.category === highlightedCategory;
                  if (!isHighlighted) return null;

                  return (
                    <g key={`text-${idx}`} style={{ pointerEvents: 'none' }}>
                      <text x={geometry.centerX} y={geometry.centerY - (fontSizeRoom * 0.8)} fontSize={fontSizeRoom} style={textStyle}>
                        {room.name}
                      </text>
                      
                      <text x={geometry.centerX} y={geometry.centerY + (fontSizeRoom * 0.5)} fontSize={fontSizeRoom * 0.8} style={{...textStyle, fill: '#333', strokeWidth: referenceWidth * 0.001}}>
                        {room.calculated_area?.toLocaleString()} ft²
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

export default CategoryAnnotatedView;