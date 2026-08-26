import "@/App.css";
import React from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicSite from "@/PublicSite";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<PublicSite />} />
      </Routes>
      <Toaster theme="dark" position="bottom-right" />
    </BrowserRouter>
  );
}
