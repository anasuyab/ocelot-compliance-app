import React, { useState, useRef } from 'react';

// --- Helper: Generate unique IDs ---
const generateId = () => Date.now();

// --- Helper: Calculate Centroids for Labels ---
const getLabelPosition = (room) => {
  if (room.type === 'rect') {
    return { x: room.coords.x + room.coords.w / 2, y: room.coords.y + room.coords.h / 2 };
  } else if (room.type === 'circle') {
    return { x: room.coords.cx, y: room.coords.cy };
  } else if (room.type === 'polygon') {
    const x = room.points.reduce((acc, p) => acc + p[0], 0) / room.points.length;
    const y = room.points.reduce((acc, p) => acc + p[1], 0) / room.points.length;
    return { x, y };
  }
  return { x: 0, y: 0 };
};

const EditorView = ({ theme = 'default', blueprintImage, initialRooms = [], onComplete, imageMetadata = null }) => {
  // --- State ---
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  
  // Interaction State
  const [dragState, setDragState] = useState(null); 
  const svgRef = useRef(null);
  const imgRef = useRef(null);
  const [initialRoomsScaled, setInitialRoomsScaled] = useState(false);

  // --- Calibration State ---
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [pxPerFoot, setPxPerFoot] = useState(4.5); 

  // --- 1. Image Loading ---
  const onImageLoad = (event) => {
    const img = event.target;
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const displayW = img.clientWidth;
    const displayH = img.clientHeight;
    
    // Determine the source dimensions for coordinates
    // Use metadata if provided, otherwise fall back to natural dimensions
    const sourceW = imageMetadata?.width || naturalW;
    const sourceH = imageMetadata?.height || naturalH;
    
    // Calculate the scale factor from source to display
    const scale = displayW / sourceW;
    
    setDimensions({ 
      w: naturalW, 
      h: naturalH,
      displayW: displayW,
      displayH: displayH,
      sourceW: sourceW,
      sourceH: sourceH,
      scale: scale
    });
    
    console.log('Image dimensions:', { 
      natural: { w: naturalW, h: naturalH },
      source: { w: sourceW, h: sourceH },
      display: { w: displayW, h: displayH },
      scale 
    });
    
    // Scale initial rooms to match display size
    if (!initialRoomsScaled && initialRooms.length > 0) {
      const scaledRooms = initialRooms.map(room => {
        const scaledRoom = { ...room };
        
        if (room.type === 'rect') {
          scaledRoom.coords = {
            x: room.coords.x * scale,
            y: room.coords.y * scale,
            w: room.coords.w * scale,
            h: room.coords.h * scale
          };
        } else if (room.type === 'circle') {
          scaledRoom.coords = {
            cx: room.coords.cx * scale,
            cy: room.coords.cy * scale,
            r: room.coords.r * scale
          };
        } else if (room.type === 'polygon') {
          scaledRoom.points = room.points.map(([x, y]) => [x * scale, y * scale]);
        }
        
        return scaledRoom;
      });
      
      setRooms(scaledRooms);
      setInitialRoomsScaled(true);
      console.log('Scaled rooms from', sourceW, 'x', sourceH, 'to', displayW, 'x', displayH);
    }
  };

  // --- 2. Auto-Dimension Calculator ---
  const updateRoomDimensionsText = (room) => {
    let dimString = "";
    if (room.type === 'rect') {
      const wFt = Math.round(room.coords.w / pxPerFoot);
      const hFt = Math.round(room.coords.h / pxPerFoot);
      dimString = `${wFt}ft x ${hFt}ft`;
    } else if (room.type === 'circle') {
      const dFt = Math.round((room.coords.r * 2) / pxPerFoot);
      dimString = `${dFt}ft Dia`;
    } else if (room.type === 'polygon') {
      // Calculate Bounding Box for polygon to get rough dimensions
      const xs = room.points.map(p => p[0]);
      const ys = room.points.map(p => p[1]);
      const w = Math.max(...xs) - Math.min(...xs);
      const h = Math.max(...ys) - Math.min(...ys);
      dimString = `${Math.round(w / pxPerFoot)}ft x ${Math.round(h / pxPerFoot)}ft (Irreg)`;
    }
    return { ...room, dimensions: dimString };
  };

  // --- 3. CRUD Actions ---
  const handleAddRoom = (type) => {
    // Spawn in the center of the current view roughly
    const startX = 200; 
    const startY = 200;
    
    let newRoom = {
      id: generateId(),
      name: "New Room",
      type: type,
      color: "rgba(0, 123, 255, 0.5)",
      dimensions: "0ft x 0ft"
    };

    if (type === 'rect') {
      newRoom.coords = { x: startX, y: startY, w: 100, h: 100 };
    } else if (type === 'circle') {
      newRoom.coords = { cx: startX + 50, cy: startY + 50, r: 50 };
    } else if (type === 'polygon') {
      // Default Triangle
      newRoom.points = [[startX, startY + 100], [startX + 50, startY], [startX + 100, startY + 100]];
    }

    newRoom = updateRoomDimensionsText(newRoom);
    setRooms([...rooms, newRoom]);
    setSelectedRoomId(newRoom.id);
  };

  const handleDeleteRoom = () => {
    if (selectedRoomId) {
      setRooms(rooms.filter(r => r.id !== selectedRoomId));
      setSelectedRoomId(null);
    }
  };

  const handleUpdateName = (val) => {
     setRooms(rooms.map(r => r.id === selectedRoomId ? { ...r, name: val } : r));
  };

  // --- 4. Mouse Logic ---
  const getMousePos = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
    return {
      x: (svgP.x - viewTransform.x) / viewTransform.scale,
      y: (svgP.y - viewTransform.y) / viewTransform.scale
    };
  };

  const handleMouseDown = (e, type, roomId, index = null) => {
    e.stopPropagation();
    const pos = getMousePos(e);
    setDragState({ type, roomId, index, startX: pos.x, startY: pos.y });
    setSelectedRoomId(roomId);
  };

  const handleMouseMove = (e) => {
    if (!dragState) return;
    const pos = getMousePos(e);
    
    setRooms(prevRooms => prevRooms.map(room => {
      if (room.id !== dragState.roomId) return room;

      const dx = pos.x - dragState.startX;
      const dy = pos.y - dragState.startY;

      let updatedRoom = { ...room };

      if (dragState.type === 'move') {
        if (room.type === 'rect') {
          updatedRoom.coords = { ...room.coords, x: room.coords.x + dx, y: room.coords.y + dy };
        } else if (room.type === 'circle') {
          updatedRoom.coords = { ...room.coords, cx: room.coords.cx + dx, cy: room.coords.cy + dy };
        } else if (room.type === 'polygon') {
          updatedRoom.points = room.points.map(p => [p[0] + dx, p[1] + dy]);
        }
      } else if (dragState.type === 'resize-rect') {
         updatedRoom.coords = { ...room.coords, w: Math.max(10, room.coords.w + dx), h: Math.max(10, room.coords.h + dy) };
      } else if (dragState.type === 'resize-circle') {
         const newR = Math.sqrt(Math.pow(pos.x - room.coords.cx, 2) + Math.pow(pos.y - room.coords.cy, 2));
         updatedRoom.coords = { ...room.coords, r: newR };
      } else if (dragState.type === 'vertex') {
        const newPoints = [...room.points];
        newPoints[dragState.index] = [pos.x, pos.y];
        updatedRoom.points = newPoints;
      }

      // ** AUTO UPDATE DIMENSIONS **
      return updateRoomDimensionsText(updatedRoom);
    }));

    if (dragState.type !== 'vertex') {
       setDragState(prev => ({ ...prev, startX: pos.x, startY: pos.y }));
    }
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  // --- Styles ---
  const handleStyle = { fill: 'white', stroke: '#007bff', strokeWidth: 2, cursor: 'crosshair' };
  
  const sidebarStyle = { 
    width: '320px', 
    padding: '20px', 
    background: '#fff', 
    borderRight: '1px solid #ddd', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px',
    boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
    zIndex: 10
  };

  // Styled Buttons
  const buttonStyle = {
    flex: 1,
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background 0.2s'
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#dc3545', // Red
    marginTop: '10px'
  };

  const actionButtonStyle = {
      ...buttonStyle,
      backgroundColor: '#28a745', // Green
      marginTop: 'auto'
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f5f5f5' }} 
         onMouseMove={handleMouseMove} 
         onMouseUp={handleMouseUp}>
      
      {/* --- Sidebar --- */}
      <div style={sidebarStyle}>
        <h3 style={{margin: '0 0 10px 0', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>Room Editor</h3>
        
        {/* Toolbar */}
        <div style={{display: 'flex', gap: '8px'}}>
          <button style={buttonStyle} onClick={() => handleAddRoom('rect')}>+ Rect</button>
          <button style={buttonStyle} onClick={() => handleAddRoom('circle')}>+ Circle</button>
          <button style={buttonStyle} onClick={() => handleAddRoom('polygon')}>+ Poly</button>
        </div>

        {/* Global Settings */}
        <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
          <strong style={{display:'block', marginBottom:'10px', color: '#555'}}>Calibration</strong>
          
          <div style={{marginBottom: '15px'}}>
             <label style={{fontSize: '0.85rem', color: '#666', display:'block', marginBottom: '5px'}}>Pan / Offset (X):</label>
             <input style={{width: '100%'}} type="range" min="-200" max="200" value={viewTransform.x} onChange={e => setViewTransform({...viewTransform, x: Number(e.target.value)})} />
          </div>

          <div>
             <label style={{fontSize: '0.85rem', color: '#666', display:'block', marginBottom: '5px'}}>
                Scale Ratio: <strong>{pxPerFoot} px/ft</strong>
             </label>
             <input style={{width: '100%'}} type="range" min="1" max="10" step="0.1" value={pxPerFoot} onChange={e => setPxPerFoot(Number(e.target.value))} />
          </div>
        </div>

        {/* Selected Room Editor */}
        {selectedRoomId ? (
          <div style={{ borderTop: '1px solid #ddd', paddingTop: '15px' }}>
            <h4 style={{margin: '0 0 10px 0'}}>Edit Selected Room</h4>
            
            <label style={{display:'block', marginBottom:'5px', fontSize:'0.9rem'}}>Room Name:</label>
            <input 
              type="text" 
              value={rooms.find(r => r.id === selectedRoomId)?.name || ''} 
              onChange={(e) => handleUpdateName(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            
            <div style={{background: '#e9ecef', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem'}}>
               <strong>Dimensions:</strong> {rooms.find(r => r.id === selectedRoomId)?.dimensions}
               <div style={{fontSize: '0.75rem', color: '#666', marginTop: '4px'}}>* Drag shape handles to update</div>
            </div>

            <button style={deleteButtonStyle} onClick={handleDeleteRoom}>
              Delete Room
            </button>
          </div>
        ) : (
          <div style={{ color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '20px', border: '2px dashed #ddd', borderRadius: '8px' }}>
            Select a room on the map to edit properties.
          </div>
        )}

        {/* Footer Actions */}
        <button 
            style={actionButtonStyle} 
            onClick={() => onComplete(rooms)} // <--- Passes data to parent
        >
            Finish & Save
        </button>
      </div>

      {/* --- Canvas --- */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ position: 'relative', boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
          <img 
            ref={imgRef}
            src={blueprintImage} 
            alt="Blueprint" 
            onLoad={onImageLoad}
            style={{ display: 'block', maxWidth: '100%', maxHeight: '90vh', pointerEvents: 'none' }} 
          />
          
          {dimensions.displayW > 0 && (
            <svg 
              ref={svgRef}
              viewBox={`0 0 ${dimensions.displayW} ${dimensions.displayH}`}
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: `${dimensions.displayW}px`, 
                height: `${dimensions.displayH}px` 
              }}
            >
            <g transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`}>
              {rooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                
                // Common shape props
                const commonProps = {
                  fill: room.color,
                  stroke: isSelected ? '#007bff' : 'black',
                  strokeWidth: isSelected ? 3 : 1,
                  opacity: 0.5,
                  style: { cursor: 'move' },
                  onMouseDown: (e) => handleMouseDown(e, 'move', room.id)
                };

                // Logic to draw handles
                let handles = null;
                if (isSelected) {
                   if (room.type === 'rect') {
                     handles = (
                       <rect x={room.coords.x + room.coords.w - 10} y={room.coords.y + room.coords.h - 10} width={20} height={20} {...handleStyle}
                         onMouseDown={(e) => handleMouseDown(e, 'resize-rect', room.id)}
                       />
                     );
                   } else if (room.type === 'circle') {
                      handles = (
                       <circle cx={room.coords.cx + room.coords.r} cy={room.coords.cy} r={8} {...handleStyle}
                         onMouseDown={(e) => handleMouseDown(e, 'resize-circle', room.id)}
                       />
                     );
                   } else if (room.type === 'polygon') {
                      handles = room.points.map((pt, idx) => (
                        <circle key={idx} cx={pt[0]} cy={pt[1]} r={6} {...handleStyle}
                          onMouseDown={(e) => handleMouseDown(e, 'vertex', room.id, idx)}
                        />
                      ));
                   }
                }

                // Logic to draw shapes
                let shape = null;
                if (room.type === 'rect') shape = <rect x={room.coords.x} y={room.coords.y} width={room.coords.w} height={room.coords.h} {...commonProps} />;
                else if (room.type === 'circle') shape = <circle cx={room.coords.cx} cy={room.coords.cy} r={room.coords.r} {...commonProps} />;
                else if (room.type === 'polygon') shape = <polygon points={room.points.map(p => p.join(',')).join(' ')} {...commonProps} />;
                
                const labelPos = getLabelPosition(room);

                return (
                  <g key={room.id}>
                    {shape}
                    {handles}
                    <text x={labelPos.x} y={labelPos.y} textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" style={{pointerEvents:'none', textShadow: '0px 0px 4px #000'}}>
                      {room.name}
                    </text>
                    {/* Show live dimensions below name */}
                    <text x={labelPos.x} y={labelPos.y + 15} textAnchor="middle" fontSize="11" fill="#eee" style={{pointerEvents:'none', textShadow: '0px 0px 4px #000'}}>
                      {room.dimensions}
                    </text>
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

export default EditorView;