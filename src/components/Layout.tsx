// src/components/Layout.tsx
import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <Header        />
      </div>

      <div className="pt-[80px] px-6 flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
