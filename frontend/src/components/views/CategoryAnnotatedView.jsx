import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';

// --- CONSTANTS ---
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
  fileName,
  roomsData, 
  categorySummary, 
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
  
  // New State: Highlight a specific category (filter view)
  const [highlightedCategory, setHighlightedCategory] = useState(null);
  
  // New State: Sidebar collapsed groups
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const sidebarRefs = useRef({}); 

  // --- Styles ---
  const textStyle = {
    fill: "black",
    fontWeight: "700", // Bolder for visibility
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
    // Initialize with variables
    const grouped = {
      [CAT_PFSA]: [],
      [CAT_NON_QUALIFIED]: [],
      [CAT_COMMON]: [],
      [CAT_SHARED]: [],
      [CAT_UNKNOWN]: []
    };
    
    if (roomsData) {
      roomsData.forEach((room, index) => {
        // Fallback to CAT_UNKNOWN if category is missing
        const cat = room.category || CAT_UNKNOWN;
        
        // Safety check: if the API returns a category we don't know, treat as Unknown
        if (!grouped[cat]) {
             // Optional: Create the key on the fly or push to unknown
             if (!grouped[CAT_UNKNOWN]) grouped[CAT_UNKNOWN] = [];
             grouped[CAT_UNKNOWN].push({ ...room, originalIndex: index });
        } else {
             grouped[cat].push({ ...room, originalIndex: index });
        }
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

  // --- Geometry Helpers (Unchanged logic) ---
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
           <h2 className={`m-0 mb-3 text-lg font-bold ${theme.textPrimary}`}>Project: {fileName}</h2>
           
           {/* Controls */}
           <div className="flex gap-2 mb-4">
            <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium ${theme.primaryButton} ${theme.primaryButtonText}`} onClick={handleZoomIn}><ZoomIn size={14} /> In</button>
            <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium ${theme.primaryButton} ${theme.primaryButtonText}`} onClick={handleZoomOut}><ZoomOut size={14} /> Out</button>
            <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm font-medium ${theme.primaryButton} ${theme.primaryButtonText}`} onClick={handleReset}><RotateCcw size={14} /> Reset</button>
          </div>

          {/* Interactive Legend in Sidebar */}
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(CATEGORY_COLORS).map(cat => (
              <div 
                key={cat} 
                onClick={() => toggleCategoryHighlight(cat)}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors border ${
                  highlightedCategory === cat ? 'bg-gray-100 border-gray-400' : 'bg-white border-transparent hover:bg-gray-50'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: CATEGORY_COLORS[cat].replace('0.6', '1') }}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-gray-700 truncate">{cat}</span>
                  <span className="text-[10px] text-gray-500">{getCategoryTotal(cat).toLocaleString()} sq ft</span>
                </div>
                {highlightedCategory === cat && <Eye size={12} className="ml-auto text-gray-500" />}
              </div>
            ))}
          </div>
        </div>

        {/* Room List (Grouped) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.entries(roomsByCategory).map(([category, rooms]) => {
             if (rooms.length === 0) return null;
             const isCollapsed = collapsedCategories[category];

             return (
               <div key={category} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                 {/* Category Header */}
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

                 {/* Room Items */}
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
                            
                            {/* Wall Measurements in Sidebar */}
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
        
        {/* Floating Title Overlay */}
        {highlightedCategory && (
           <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30 bg-black/70 text-white px-4 py-1 rounded-full text-sm backdrop-blur-md pointer-events-none">
             Highlighting: <span className="font-bold">{highlightedCategory}</span>
           </div>
        )}

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
                  
                  // Dim opacity if we are highlighting a specific category and this room doesn't match
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

                {/* 2. DRAW TEXT (Only if Highlighted or No Filter) */}
                {roomsData.map((room, idx) => {
                  const geometry = getRoomGeometry(room);
                  if (!geometry) return null;

                  const isHighlighted = !highlightedCategory || room.category === highlightedCategory;
                  if (!isHighlighted) return null; // Hide text for non-highlighted rooms to reduce clutter

                  return (
                    <g key={`text-${idx}`} style={{ pointerEvents: 'none' }}>
                      {/* Name Label */}
                      <text x={geometry.centerX} y={geometry.centerY - (fontSizeRoom * 0.8)} fontSize={fontSizeRoom} style={textStyle}>
                        {room.name}
                      </text>
                      
                      {/* Area Label */}
                      <text x={geometry.centerX} y={geometry.centerY + (fontSizeRoom * 0.5)} fontSize={fontSizeRoom * 0.8} style={{...textStyle, fill: '#333', strokeWidth: referenceWidth * 0.001}}>
                        {room.calculated_area?.toLocaleString()} ft²
                      </text>

                      {/* Wall Labels */}
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