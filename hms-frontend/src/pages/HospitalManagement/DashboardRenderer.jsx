import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

const PRESET_DEPARTMENTS = [
  "All",
  "Cardiology",
  "Pediatrics",
  "Orthopedics",
  "General Medicine",
  "Dermatology",
  "Neurology",
  "Gynecology"
];

// Helper to format currency
const inr = v => `₹${Number(v || 0).toLocaleString("en-IN")}`;

export default function DashboardRenderer({ dashboardId }) {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalFilters, setGlobalFilters] = useState({
    dateRange: "LAST_30_DAYS",
    department: "All"
  });

  // Keep track of widget data
  const [widgetData, setWidgetData] = useState({});
  const [widgetLoading, setWidgetLoading] = useState({});
  const [aiInsights, setAiInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const timersRef = useRef({});

  useEffect(() => {
    if (dashboardId) {
      loadDashboard();
    }
    return () => {
      // Clear all active timers on unmount
      Object.values(timersRef.current).forEach(clearInterval);
    };
  }, [dashboardId]);

  // Refetch widget data whenever global filters change
  useEffect(() => {
    if (dashboard) {
      dashboard.widgets.forEach(w => {
        fetchWidgetData(w);
        setupRefreshTimer(w);
      });
      fetchAIInsights();
    }
  }, [dashboard, globalFilters]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/dashboard/${dashboardId}`);
      setDashboard(res.data);
    } catch (err) {
      console.error("Failed to load dashboard layout", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await API.get(`/api/dashboard/ai-insights/${dashboardId}`);
      setAiInsights(res.data.insights || []);
    } catch (err) {
      console.error("Failed to fetch AI insights", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const fetchWidgetData = async (widget) => {
    setWidgetLoading(prev => ({ ...prev, [widget.id]: true }));
    try {
      // Merge local widget query with global filters
      let localQuery = {};
      try {
        localQuery = JSON.parse(widget.queryJson || "{}");
      } catch {}

      const mergedQuery = {
        ...localQuery,
        dateRange: globalFilters.dateRange,
        department: globalFilters.department === "All" ? "" : globalFilters.department
      };

      const res = await API.get("/api/dashboard/data", {
        params: {
          dataSource: widget.dataSource,
          widgetType: widget.widgetType,
          queryJson: JSON.stringify(mergedQuery)
        }
      });

      setWidgetData(prev => ({ ...prev, [widget.id]: res.data }));
    } catch (err) {
      console.error(`Failed to fetch data for widget ${widget.widgetTitle}`, err);
    } finally {
      setWidgetLoading(prev => ({ ...prev, [widget.id]: false }));
    }
  };

  const setupRefreshTimer = (widget) => {
    // Clear existing timer if any
    if (timersRef.current[widget.id]) {
      clearInterval(timersRef.current[widget.id]);
    }

    let config = {};
    try {
      config = JSON.parse(widget.configJson || "{}");
    } catch {}

    const interval = (config.refreshInterval || 300) * 1000;
    timersRef.current[widget.id] = setInterval(() => {
      fetchWidgetData(widget);
    }, interval);
  };

  const handleFilterChange = (key, val) => {
    setGlobalFilters(prev => ({ ...prev, [key]: val }));
  };

  if (loading) {
    return (
      <div className="rdr-loading">
        <span className="spinner">🔄</span> Loading dashboard view...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <h3>Dashboard Not Found</h3>
        <button className="btn-sec" onClick={() => navigate("/hospital/analytics")}>Go Back</button>
      </div>
    );
  }

  // Group widgets into a row-based layout grid
  const widgets = dashboard.widgets || [];

  return (
    <div className="rdr-root">
      <style>{`
        .rdr-root {
          padding: 24px 30px;
          min-height: calc(100vh - 52px);
          background: #F8FAFC;
          color: #0F172A;
          font-family: 'DM Sans', sans-serif;
        }
        [data-theme="dark"] .rdr-root {
          background: #090F1C;
          color: #E2E8F0;
        }
        
        .rdr-hdr {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .rdr-title-wrap {
          flex: 1;
        }
        .rdr-title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        
        /* ── Filters bar ── */
        .filter-bar {
          display: flex;
          gap: 12px;
          align-items: center;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 10px 16px;
          margin-bottom: 24px;
          box-shadow: 0 1px 4px rgba(15,23,42,0.03);
          flex-wrap: wrap;
        }
        [data-theme="dark"] .filter-bar {
          background: #0F172A;
          border-color: #1E293B;
        }
        .filter-label {
          font-size: 11px;
          font-weight: 800;
          color: #64748B;
          text-transform: uppercase;
        }
        .filter-select {
          border: 1px solid #CBD5E1;
          background: transparent;
          color: inherit;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }
        [data-theme="dark"] .filter-select {
          border-color: #334155;
        }
        
        /* ── CSS Grid Layout ── */
        .rdr-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 16px;
          position: relative;
        }
        
        /* ── Widget Wrapper ── */
        .rdr-widget {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          box-shadow: 0 1px 6px rgba(15,23,42,0.03);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          min-height: 120px;
        }
        [data-theme="dark"] .rdr-widget {
          background: #0F172A;
          border-color: #1E293B;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .widget-head {
          padding: 12px 18px 10px;
          border-bottom: 1px solid #F1F5F9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        [data-theme="dark"] .widget-head {
          border-color: #1E293B;
        }
        .widget-title {
          font-size: 11px;
          font-weight: 800;
          color: #0F172A;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        [data-theme="dark"] .widget-title {
          color: #E2E8F0;
        }
        .widget-title::before {
          content: '';
          width: 3px; height: 11px;
          background: var(--widget-accent, #0D9488);
          border-radius: 2px;
        }
        
        .widget-body {
          padding: 16px 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }
        
        /* ── Widget Renderings ── */
        
        /* KPI Card */
        .kpi-val {
          font-size: 32px;
          font-weight: 800;
          font-family: 'DM Mono', monospace;
          line-height: 1;
          letter-spacing: -1px;
        }
        .kpi-lbl {
          font-size: 11.5px;
          color: #64748B;
          margin-top: 6px;
          font-weight: 600;
        }
        
        /* Chart SVG Containers */
        .chart-svg-container {
          width: 100%;
          height: 100%;
          min-height: 130px;
          position: relative;
        }
        
        /* Progress Bar */
        .prog-bar-track {
          width: 100%;
          height: 8px;
          background: #F1F5F9;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
        }
        [data-theme="dark"] .prog-bar-track {
          background: #1E293B;
        }
        .prog-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.8s ease;
        }
        
        /* Data Table view */
        .table-wrap {
          width: 100%;
          overflow-x: auto;
          max-height: 250px;
        }
        .rdr-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 12px;
        }
        .rdr-table th {
          padding: 8px 10px;
          border-bottom: 1.5px solid #E2E8F0;
          font-weight: 700;
          color: #64748B;
        }
        [data-theme="dark"] .rdr-table th {
          border-color: #334155;
          color: #94A3B8;
        }
        .rdr-table td {
          padding: 8px 10px;
          border-bottom: 1px solid #F1F5F9;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
        [data-theme="dark"] .rdr-table td {
          border-color: #1E293B;
        }
        
        /* AI Insights Card Styling */
        .ins-box {
          background: rgba(124,58,237,0.06);
          border: 1px dashed rgba(124,58,237,0.25);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 10px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .ins-dot {
          color: #7C3AED;
          font-size: 16px;
          line-height: 1;
        }
        .ins-text {
          font-size: 12.5px;
          font-weight: 600;
          line-height: 1.4;
          color: #475569;
        }
        [data-theme="dark"] .ins-text {
          color: #CBD5E1;
        }
        
        /* Loader styles */
        .spinner {
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .rdr-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          flex-direction: column;
          gap: 12px;
          font-weight: 600;
          color: #0D9488;
        }
        
        @media(max-width: 900px) {
          .rdr-grid {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .rdr-widget {
            width: 100% !important;
            left: 0 !important;
            position: relative !important;
            height: auto !important;
          }
        }
      `}</style>

      {/* HEADER BAR */}
      <div className="rdr-hdr">
        <div className="rdr-title-wrap">
          <h1 className="rdr-title">{dashboard.dashboardName}</h1>
          <p className="ast-subtitle">{dashboard.description || "Interactive dynamic statistics"}</p>
        </div>
        <button className="btn-sec" onClick={() => navigate("/hospital/analytics")}>
          <span>←</span> Back to Studio
        </button>
      </div>

      {/* GLOBAL FILTERS */}
      <div className="filter-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>🔍</span>
          <span className="filter-label">Filters</span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select 
            className="filter-select"
            value={globalFilters.dateRange} 
            onChange={(e) => handleFilterChange("dateRange", e.target.value)}
          >
            <option value="TODAY">Today</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="LAST_30_DAYS">Last 30 Days</option>
            <option value="ALL">All Time</option>
          </select>
          
          <select 
            className="filter-select"
            value={globalFilters.department} 
            onChange={(e) => handleFilterChange("department", e.target.value)}
          >
            {PRESET_DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept} Department</option>
            ))}
          </select>
        </div>
      </div>

      {/* RENDER CANVAS GRID */}
      <div className="rdr-grid">
        {widgets.map(w => {
          let config = {};
          try {
            config = JSON.parse(w.configJson || "{}");
          } catch {}

          const accentColor = config.color || "#0D9488";
          const data = widgetData[w.id] || {};
          const isWidgetLoading = widgetLoading[w.id];

          // Calculate standard grid layout dimensions
          // We support rendering based on columns on desktop
          const gridColStart = w.positionX + 1;
          const gridColEnd = gridColStart + w.width;
          const gridRowStart = w.positionY + 1;
          const gridRowEnd = gridRowStart + w.height;

          return (
            <div 
              key={w.id} 
              className="rdr-widget"
              style={{
                gridColumn: `${gridColStart} / ${gridColEnd}`,
                gridRow: `${gridRowStart} / ${gridRowEnd}`,
                height: w.height * 60,
                "--widget-accent": accentColor
              }}
            >
              <div className="widget-head">
                <span className="widget-title">{w.widgetTitle}</span>
                {isWidgetLoading && <span className="spinner" style={{ fontSize: 11, opacity: 0.7 }}>🔄</span>}
              </div>

              <div className="widget-body">
                {renderWidgetContent(w.widgetType, data, accentColor, w.dataSource)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // Dynamic Widget Core Renderer
  // ─────────────────────────────────────────────────────────────
  function renderWidgetContent(type, data, color, dataSource) {
    const val = data.value !== undefined ? data.value : 0;
    const records = data.data || [];

    // Combine loading cases
    if (Object.keys(data).length === 0) {
      return <div style={{ fontSize: 11, color: "#64748B", textAlign: "center" }}>Fetching live stats...</div>;
    }

    switch (type.toUpperCase()) {
      case "KPI_CARD":
        const displayVal = dataSource.toUpperCase() === "BILLING" ? inr(val) : val.toLocaleString();
        return (
          <div>
            <div className="kpi-val" style={{ color }}>{displayVal}</div>
            <div className="kpi-lbl">Total scoped data</div>
          </div>
        );

      case "LINE_CHART":
      case "AREA_CHART":
        return renderLineChart(records, color, type.toUpperCase() === "AREA_CHART");

      case "BAR_CHART":
        return renderBarChart(records, color);

      case "PIE_CHART":
      case "DONUT_CHART":
        return renderPieChart(records, type.toUpperCase() === "DONUT_CHART");

      case "GAUGE":
        return renderGauge(val, color);

      case "PROGRESS_BAR":
        const limitVal = val > 100 ? 100 : val;
        return (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700 }}>
              <span>Target Achievement</span>
              <span style={{ color }}>{val}%</span>
            </div>
            <div className="prog-bar-track">
              <div className="prog-bar-fill" style={{ width: `${limitVal}%`, background: color }} />
            </div>
          </div>
        );

      case "TABLE":
        return renderTable(records, dataSource);

      case "ANNOUNCEMENTS":
        return renderAnnouncements(records);

      case "NOTIFICATIONS":
        return renderNotifications(records);

      case "AI_INSIGHTS_CARD":
        return renderAIInsights();

      case "LIVE_COUNTER":
        return (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 24, animation: "spin 2s linear infinite", display: "inline-block" }}>⭐</span>
            <div>
              <div className="kpi-val" style={{ color, fontSize: 24 }}>{val}</div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.6 }}>Active Count</div>
            </div>
          </div>
        );

      default:
        return <div style={{ fontSize: 11 }}>Widget type unsupported: {type}</div>;
    }
  }

  // ── Render SVG Bar Chart ──
  function renderBarChart(chartData, color) {
    const entries = Object.entries(chartData);
    if (entries.length === 0) return <div style={{ fontSize: 11, textAlign: "center" }}>No trend details found</div>;

    const maxVal = Math.max(...entries.map(e => Number(e[1])), 1);
    const width = 240, height = 120;
    const padding = 15;
    const graphW = width - padding * 2;
    const graphH = height - padding * 2;
    const barWidth = graphW / entries.length - 4;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        {entries.map(([label, v], idx) => {
          const valNum = Number(v);
          const barH = (valNum / maxVal) * graphH;
          const x = padding + idx * (graphW / entries.length) + 2;
          const y = height - padding - barH;
          
          return (
            <g key={label}>
              <rect 
                x={x} y={y} 
                width={barWidth} height={barH} 
                fill={color} rx="3"
                title={`${label}: ${v}`}
              />
              <text 
                x={x + barWidth / 2} y={height - 2} 
                fontSize="7.5" fontWeight="700"
                textAnchor="middle" fill="#64748B"
              >
                {label.substring(label.length - 5)}
              </text>
              <text 
                x={x + barWidth / 2} y={y - 3} 
                fontSize="7.5" fontWeight="800"
                textAnchor="middle" fill={color}
              >
                {v}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  // ── Render SVG Line/Area Chart ──
  function renderLineChart(chartData, color, fillArea) {
    const entries = Object.entries(chartData);
    if (entries.length === 0) return <div style={{ fontSize: 11, textAlign: "center" }}>No trend details found</div>;

    const maxVal = Math.max(...entries.map(e => Number(e[1])), 1);
    const width = 240, height = 120;
    const padding = 15;
    const graphW = width - padding * 2;
    const graphH = height - padding * 2;
    
    // Compute coordinates
    const points = entries.map(([label, v], idx) => {
      const valNum = Number(v);
      const x = padding + (idx * (graphW / (entries.length - 1 || 1)));
      const y = height - padding - ((valNum / maxVal) * graphH);
      return { x, y, label, val: v };
    });

    const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    
    let areaPathData = "";
    if (fillArea) {
      areaPathData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    }

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        {fillArea && (
          <path d={areaPathData} fill={color} opacity="0.15" />
        )}
        <path d={pathData} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="3" fill="#fff" stroke={color} strokeWidth="1.5" />
            <text x={p.x} y={height - 2} fontSize="7" fontWeight="700" textAnchor="middle" fill="#64748B">
              {p.label.substring(p.label.length - 5)}
            </text>
            <text x={p.x} y={p.y - 5} fontSize="7" fontWeight="800" textAnchor="middle" fill={color}>
              {p.val}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  // ── Render SVG Pie/Donut Chart ──
  function renderPieChart(chartData, isDonut) {
    const entries = Object.entries(chartData);
    if (entries.length === 0) return <div style={{ fontSize: 11, textAlign: "center" }}>No categorical breakdowns</div>;

    const total = entries.reduce((acc, curr) => acc + Number(curr[1]), 0);
    const colors = ["#0D9488", "#2563EB", "#7C3AED", "#D97706", "#DC2626", "#059669"];

    let accumulatedAngle = 0;
    const cx = 60, cy = 60, r = 40;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <svg viewBox="0 0 120 120" width="100" height="100" style={{ flexShrink: 0 }}>
          {entries.map(([label, v], idx) => {
            const valNum = Number(v);
            const percentage = total > 0 ? valNum / total : 0;
            const angle = percentage * 360;
            
            // Coordinates of the slice edge
            const x1 = cx + r * Math.cos((accumulatedAngle - 90) * Math.PI / 180);
            const y1 = cy + r * Math.sin((accumulatedAngle - 90) * Math.PI / 180);
            
            accumulatedAngle += angle;
            
            const x2 = cx + r * Math.cos((accumulatedAngle - 90) * Math.PI / 180);
            const y2 = cy + r * Math.sin((accumulatedAngle - 90) * Math.PI / 180);
            
            const largeArc = angle > 180 ? 1 : 0;
            const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            const sliceColor = colors[idx % colors.length];

            return (
              <path key={label} d={d} fill={sliceColor} />
            );
          })}
          
          {isDonut && (
            <circle cx={cx} cy={cy} r="22" fill="#fff" />
          )}
        </svg>
        
        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          {entries.map(([label, v], idx) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[idx % colors.length], display: "inline-block" }} />
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 90 }}>{label}: {v}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Render SVG Gauge ──
  function renderGauge(val, color) {
    const minVal = 0, maxVal = 100;
    const progress = Math.max(minVal, Math.min(maxVal, val));
    const r = 40, cx = 60, cy = 60;
    const circ = Math.PI * r;
    const dash = circ * (progress / 100);

    return (
      <div style={{ textAlign: "center" }}>
        <svg viewBox="0 0 120 70" width="110" height="65" style={{ margin: "0 auto" }}>
          {/* Background track */}
          <path 
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} 
            fill="none" stroke="#F1F5F9" strokeWidth="10" strokeLinecap="round" 
          />
          {/* Active fill */}
          <path 
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} 
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
          />
          <text x={cx} y={cy - 5} textAnchor="middle" fontSize="14" fontWeight="900" fill={color} fontFamily="DM Mono">
            {val}%
          </text>
        </svg>
        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6, marginTop: 4 }}>System Output Level</div>
      </div>
    );
  }

  // ── Render Tabular Data Table ──
  function renderTable(records, dataSource) {
    if (!Array.isArray(records) || records.length === 0) {
      return <div style={{ fontSize: 11, textAlign: "center", color: "#64748B" }}>No recent records found</div>;
    }

    // Determine column mapping based on datasource
    let headers = ["ID", "Detail", "Status"];
    let rows = [];

    if (dataSource.toUpperCase() === "PATIENTS") {
      headers = ["UHID", "Name", "Problem", "Gender"];
      rows = records.map(r => [
        r.uhid ? r.uhid.substring(0, 8) : `#${r.patientId}`,
        r.patientName,
        r.problem || "—",
        r.gender || "—"
      ]);
    } else if (dataSource.toUpperCase() === "APPOINTMENTS") {
      headers = ["No.", "Customer", "Service", "Date"];
      rows = records.map(r => [
        r.appointmentNumber ? r.appointmentNumber.substring(0, 6) : `#${r.id}`,
        r.customerName,
        r.serviceName || "—",
        r.appointmentDate || "—"
      ]);
    } else if (dataSource.toUpperCase() === "PHARMACY" || dataSource.toUpperCase() === "INVENTORY") {
      headers = ["Medicine", "Category", "Stock", "Alert"];
      rows = records.map(r => [
        r.medicineName,
        r.medicineCategory || "—",
        r.quantity,
        r.lowStockAlertLevel
      ]);
    } else if (dataSource.toUpperCase() === "NURSES") {
      headers = ["Code", "Name", "Shift", "Status"];
      rows = records.map(r => [
        r.staffCode || `#${r.staffId}`,
        r.staffName,
        r.shiftType || "Rotational",
        r.status || "ACTIVE"
      ]);
    } else {
      // Default fallback mapper
      headers = ["ID", "Name", "Created Date"];
      rows = records.map(r => [
        r.id || r.patientId || r.doctorId || "—",
        r.patientName || r.doctorName || r.staffName || "—",
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"
      ]);
    }

    return (
      <div className="table-wrap">
        <table className="rdr-table">
          <thead>
            <tr>
              {headers.map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                {row.map((val, cellIdx) => (
                  <td key={cellIdx}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ── Render Announcements list ──
  function renderAnnouncements(records) {
    if (records.length === 0) return <div style={{ fontSize: 11, textAlign: "center" }}>No broadcasts active</div>;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
        {records.map((a, i) => (
          <div key={i} style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>📢 {a.title}</div>
            <div style={{ fontSize: 10.5, color: "#64748B", marginTop: 2 }}>{a.message || a.content}</div>
          </div>
        ))}
      </div>
    );
  }

  // ── Render Notifications feed ──
  function renderNotifications(records) {
    if (records.length === 0) return <div style={{ fontSize: 11, textAlign: "center" }}>No notification logs</div>;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
        {records.map((n, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#DC2626" }} />
            <div style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {n.message || n.content}
            </div>
            <span style={{ fontSize: 9, opacity: 0.6 }}>{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
          </div>
        ))}
      </div>
    );
  }

  // ── Render AI Insights Bullet Box ──
  function renderAIInsights() {
    if (loadingInsights) {
      return (
        <div style={{ textAlign: "center", color: "#7C3AED", fontSize: 12, fontWeight: 700 }}>
          <span className="spinner" style={{ marginRight: 6 }}>🔄</span>
          AI is analyzing data trends...
        </div>
      );
    }

    if (aiInsights.length === 0) {
      return <div style={{ fontSize: 11, textAlign: "center" }}>No clinical insights calculated.</div>;
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {aiInsights.map((insight, idx) => (
          <div key={idx} className="ins-box">
            <span className="ins-dot">🧠</span>
            <span className="ins-text">{insight}</span>
          </div>
        ))}
      </div>
    );
  }
}
