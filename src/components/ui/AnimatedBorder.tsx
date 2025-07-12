import React from 'react';

const AnimatedBorder: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative flex items-center justify-center group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      <div className="relative w-full">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorder;