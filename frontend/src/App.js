import "@/App.css";
import React from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicSite from "@/PublicSite";
import Studio from "@/studio/Studio";

const STUDIO_PATH = (process.env.REACT_APP_STUDIO_PATH || "studio").replace(/^\/+/, "");

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={`/${STUDIO_PATH}`} element={<Studio />} />
        <Route path={`/${STUDIO_PATH}/*`} element={<Studio />} />
        <Route path="*" element={<PublicSite />} />
      </Routes>
      <Toaster theme="dark" position="bottom-right" />
    </BrowserRouter>
  );
}
