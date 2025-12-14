import React from 'react';

const DetailRow = ({ label, text }) => (
    <div className="text-sm">
      <span className="font-medium text-slate-700">{label}:</span>{' '}
      <span className="text-slate-600">{text}</span>
    </div>
  );

  export default DetailRow;