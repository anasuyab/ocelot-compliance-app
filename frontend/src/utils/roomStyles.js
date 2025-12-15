// Accessible color palette with high contrast borders
export const getRoomStyle = (type, isSelected) => {
    const styles = {
      'Circulation': { fill: 'rgba(200, 200, 200, 0.4)', border: '#555555' }, // Grey
      'Office': { fill: 'rgba(59, 130, 246, 0.4)', border: '#1d4ed8' },     // Blue
      'Assembly': { fill: 'rgba(16, 185, 129, 0.4)', border: '#047857' },   // Green
      'Support': { fill: 'rgba(245, 158, 11, 0.4)', border: '#b45309' },    // Orange
      'Restroom': { fill: 'rgba(239, 68, 68, 0.4)', border: '#b91c1c' },    // Red
      'Gymnasium': { fill: 'rgba(139, 92, 246, 0.4)', border: '#6d28d9' },  // Purple
    };
  
    const defaultStyle = { fill: 'rgba(100, 116, 139, 0.4)', border: '#334155' };
    const theme = styles[type] || defaultStyle;
  
    return {
      fill: theme.fill,
      stroke: isSelected ? '#000000' : theme.border,
      strokeWidth: isSelected ? 3 : 2,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };
  };