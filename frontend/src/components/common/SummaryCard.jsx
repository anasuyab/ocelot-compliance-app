import React from 'react';

const SummaryCard = ({ label, value, total, color, icon }) => {
  return (
    <div className={`${color} border rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {total && <div className="text-sm opacity-75 mt-1">of {total}</div>}
    </div>
  );
};

export default SummaryCard;