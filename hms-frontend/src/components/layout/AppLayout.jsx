import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useTheme } from "../../hooks/useTheme";
import MasterAIDock from "../nexus/MasterAIDock";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { isDark } = useTheme();
  const location = useLocation();

  // ── Inject Google Translate widget (hidden) ───────────────────────
  useEffect(() => {
    // Define the callback BEFORE loading the script
    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };

    // Only inject script once
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    // Hide the Google Translate banner/toolbar via CSS
    const style = document.createElement("style");
    style.id = "goog-translate-hide";
    style.textContent = `
      .goog-te-banner-frame,
      .goog-te-balloon-frame,
      #goog-gt-tt,
      .goog-te-balloon-frame,
      .goog-tooltip,
      .goog-tooltip:hover,
      .goog-text-highlight {
        display: none !important;
      }
      body {
        top: 0px !important;
        position: static !important;
      }
      .skiptranslate {
        display: none !important;
      }
    `;
    if (!document.getElementById("goog-translate-hide")) {
      document.head.appendChild(style);
    }
  }, []);

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: isDark ? "#0A1628" : "#EEF2F7",
      transition: "background 0.25s ease",
    }}>
      {/* Fixed Topbar spans full width */}
      <Topbar sidebarWidth={sidebarWidth} />

      {/* Fixed Sidebar (starts below topbar via CSS top:52px) */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Spacer so main content doesn't go under sidebar */}
      <div style={{
        width: sidebarWidth,
        flexShrink: 0,
        transition: "width 0.25s ease",
      }} />

      {/* Main content area — padded for topbar */}
      <main style={{
        flex: 1,
        minWidth: 0,
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        paddingTop: 56,
        background: isDark ? "#0A1628" : "#EEF2F7",
        transition: "background 0.25s ease",
      }}>
        <Outlet />
      </main>

      {/* ── Unified Master AI Floating Control Center (Only on Dashboard) ── */}
      {/^\/hospital\/dashboard\/?$/.test(location.pathname) && <MasterAIDock />}

      {/* Hidden Google Translate widget container (required by the script) */}
      <div id="google_translate_element" style={{ display: "none" }} />
    </div>
  );
}