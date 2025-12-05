import React from "react";

export const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-all hover:border-[#494623]/30">
      {children}
    </div>
  );
};

export default Card;
