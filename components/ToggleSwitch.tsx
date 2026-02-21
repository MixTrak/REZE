'use client';

import React, { useState, ChangeEvent } from 'react';

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}

const ToggleSwitch: React.FC<ToggleProps> = ({ 
  checked: externalChecked, 
  onChange: externalOnChange, 
  label 
}) => {
  const [internalChecked, setInternalChecked] = useState(false);
  const checked = externalChecked !== undefined ? externalChecked : internalChecked;
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    setInternalChecked(newChecked);
    externalOnChange?.(newChecked);
  };

  return (
    <label className="inline-flex items-center cursor-pointer">
      {label && <span className="mr-3 text-sm font-medium">{label}</span>}
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={handleChange}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
