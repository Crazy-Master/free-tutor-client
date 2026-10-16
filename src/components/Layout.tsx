// src/components/Layout.tsx
import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useUiStore } from "../store/uiStore";

const Layout: React.FC = () => {
  const setWindowWidth = useUiStore((s) => s.setWindowWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setWindowWidth]);  

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sticky top-0 z-50 bg-white shadow">
        <Header        />
      </div>

      <div className="px-4 sm:px-6 flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
