import React from "react";

export default function Loader() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
    </div>
  );
}
