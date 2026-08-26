import "@/App.css";
import React, { Suspense } from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicSite from "@/PublicSite";

const ADMIN_HOST = "socialstartup-admin.socialagency.workers.dev";
const IS_PREVIEW = new URLSearchParams(window.location.search).has("__sgpreview");
const ADMIN_ONLY = window.location.hostname === ADMIN_HOST && !IS_PREVIEW;
const AdminStudio = React.lazy(() => import("@/studio/Studio"));

const StudioLoading = () => (
  <div style={{ minHeight: "100vh", background: "#050505" }} aria-hidden="true" />
);

export default function App() {
  if (ADMIN_ONLY) {
    return (
      <Suspense fallback={<StudioLoading />}>
        <AdminStudio />
        <Toaster theme="dark" position="bottom-right" />
      </Suspense>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<PublicSite />} />
      </Routes>
      <Toaster theme="dark" position="bottom-right" />
    </BrowserRouter>
  );
}
