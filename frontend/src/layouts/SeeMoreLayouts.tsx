// src/layouts/SeeMoreLayouts.tsx
import React, { ReactNode } from "react";  // Import ReactNode để định nghĩa kiểu cho children


interface SeeMoreLayoutsProps {
  children: ReactNode;  // Khai báo kiểu cho children là ReactNode
}

const SeeMoreLayouts: React.FC<SeeMoreLayoutsProps> = ({ children }) => {
  return (

      
      <main className="content">
        {children}  {/* Các component content sẽ thay đổi ở đây */}
      </main>

  );
};

export default SeeMoreLayouts;
