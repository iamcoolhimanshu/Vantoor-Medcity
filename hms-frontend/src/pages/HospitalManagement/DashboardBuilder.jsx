import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";

const WIDGET_TYPES = [
  { type: "KPI_CARD", label: "KPI Card", icon: "💎", defaultW: 3, defaultH: 2 },
  { type: "LINE_CHART", label: "Line Chart", icon: "📈", defaultW: 6, defaultH: 3 },
  { type: "BAR_CHART", label: "Bar Chart", icon: "📊", defaultW: 6, defaultH: 3 },
  { type: "PIE_CHART", label: "Pie Chart", icon: "🍕", defaultW: 4, defaultH: 3 },
  { type: "AREA_CHART", label: "Area Chart", icon: "🌊", defaultW: 6, defaultH: 3 },
  { type: "DONUT_CHART", label: "Donut Chart", icon: "🍩", defaultW: 4, defaultH: 3 },
  { type: "GAUGE", label: "Gauge Dial", icon: "⏲️", defaultW: 3, defaultH: 3 },
  { type: "PROGRESS_BAR", label: "Progress Bar", icon: "🏁", defaultW: 4, defaultH: 2 },
  { type: "TABLE", label: "Data Table", icon: "📅", defaultW: 6, defaultH: 4 },
  { type: "CALENDAR", label: "Calendar", icon: "📆", defaultW: 4, defaultH: 4 },
  { type: "ANNOUNCEMENTS", label: "Announcements", icon: "📢", defaultW: 4, defaultH: 3 },
  { type: "NOTIFICATIONS", label: "Notifications", icon: "🔔", defaultW: 4, defaultH: 3 },
  { type: "AI_INSIGHTS_CARD", label: "AI Insights", icon: "🧠", defaultW: 6, defaultH: 3 },
  { type: "LIVE_COUNTER", label: "Live Counter", icon: "⏱️", defaultW: 3, defaultH: 2 }
];

const DATA_SOURCES = [
  { value: "PATIENTS", label: "Patients Module" },
  { value: "APPOINTMENTS", label: "Appointments Module" },
  { value: "DOCTORS", label: "Doctors Module" },
  { value: "NURSES", label: "Nurses/Staff" },
  { value: "BILLING", label: "Billing/Invoice" },
  { value: "INVENTORY", label: "Pharmacy Inventory" },
  { value: "INSURANCE", label: "Insurance Claims" },
  { value: "LABORATORY", label: "Lab Tests" },
  { value: "AI_ANALYTICS", label: "AI Forecast Engine" },
  { value: "DYNAMIC_FORMS", label: "Dynamic Forms Hub" },
  { value: "ANNOUNCEMENTS", label: "Broadcasting Feed" },
  { value: "NOTIFICATIONS", label: "Standard Notifications" }
];

const PRESET_COLORS = [
  "#0D9488", // Teal
  "#2563EB", // Blue
  "#7C3AED", // Violet
  "#D97706", // Amber
  "#DC2626", // Red
  "#059669", // Green
  "#0891B2", // Cyan
  "#DB2777"  // Pink
];

export default function DashboardBuilder({ dashboardId }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Dashboard Master settings
  const [name, setName] = useState("My Custom Dashboard");
  const [description, setDescription] = useState("Custom analytics layout");
  const [roleType, setRoleType] = useState("ROLE_HOSPITAL_ADMIN");
  const [status, setStatus] = useState("DRAFT");
  const [isDefault, setIsDefault] = useState(false);

  // Layout widgets list
  const [widgets, setWidgets] = useState([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);

  // Drag and Resize State variables
  const [activeDragId, setActiveDragId] = useState(null);
  const [activeResizeId, setActiveResizeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ w: 0, h: 0 });
  const [dragStartCoord, setDragStartCoord] = useState({ x: 0, y: 0 });
  const [canvasCellWidth, setCanvasCellWidth] = useState(80); // computed dynamically

  const gridRowHeight = 60; // 60px height per unit
  const gridColumns = 12; // 12 columns grid

  useEffect(() => {
    if (dashboardId) {
      loadDashboard();
    }
    computeCellWidth();
    window.addEventListener("resize", computeCellWidth);
    return () => window.removeEventListener("resize", computeCellWidth);
  }, [dashboardId]);

  const computeCellWidth = () => {
    if (canvasRef.current) {
      setCanvasCellWidth(canvasRef.current.clientWidth / gridColumns);
    }
  };

  const loadDashboard = async () => {
    try {
      const res = await API.get(`/api/dashboard/${dashboardId}`);
      setName(res.data.dashboardName);
      setDescription(res.data.description || "");
      setRoleType(res.data.roleType || "ROLE_HOSPITAL_ADMIN");
      setStatus(res.data.status || "DRAFT");
      setIsDefault(!!res.data.isDefault);
      setWidgets(Array.isArray(res.data.widgets) ? res.data.widgets : []);
    } catch (err) {
      console.error("Failed to load dashboard configuration", err);
    }
  };

  const handleSave = async () => {
    const payload = {
      id: dashboardId ? Number(dashboardId) : null,
      dashboardName: name,
      description,
      roleType,
      status,
      isDefault,
      widgets
    };

    try {
      if (dashboardId) {
        await API.put(`/api/dashboard/update/${dashboardId}`, payload);
      } else {
        await API.post("/api/dashboard/create", payload);
      }
      alert("Dashboard configuration saved successfully!");
      navigate("/hospital/analytics");
    } catch (err) {
      alert("Failed to save dashboard. Make sure fields are valid.");
    }
  };

  const addWidget = (widgetMeta) => {
    // Find empty spot on grid
    let newY = 0;
    widgets.forEach(w => {
      if (w.positionY + w.height > newY) {
        newY = w.positionY + w.height;
      }
    });

    const newWidget = {
      id: Date.now(), // temporary ID
      widgetType: widgetMeta.type,
      widgetTitle: widgetMeta.label,
      dataSource: "PATIENTS",
      queryJson: JSON.stringify({ metric: "COUNT", dateRange: "LAST_30_DAYS" }),
      configJson: JSON.stringify({ color: PRESET_COLORS[0], refreshInterval: 300 }),
      positionX: 0,
      positionY: newY,
      width: widgetMeta.defaultW,
      height: widgetMeta.defaultH
    };

    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidgetId(newWidget.id);
  };

  const removeWidget = (id) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    if (selectedWidgetId === id) setSelectedWidgetId(null);
  };

  const getSelectedWidget = () => {
    return widgets.find(w => w.id === selectedWidgetId);
  };

  const updateSelectedWidgetField = (field, val) => {
    setWidgets(prev => prev.map(w => {
      if (w.id === selectedWidgetId) {
        return { ...w, [field]: val };
      }
      return w;
    }));
  };

  const updateSelectedWidgetConfigField = (key, val) => {
    const widget = getSelectedWidget();
    if (!widget) return;
    try {
      const config = JSON.parse(widget.configJson || "{}");
      config[key] = val;
      updateSelectedWidgetField("configJson", JSON.stringify(config));
    } catch {
      const config = {};
      config[key] = val;
      updateSelectedWidgetField("configJson", JSON.stringify(config));
    }
  };

  const updateSelectedWidgetQueryField = (key, val) => {
    const widget = getSelectedWidget();
    if (!widget) return;
    try {
      const query = JSON.parse(widget.queryJson || "{}");
      query[key] = val;
      updateSelectedWidgetField("queryJson", JSON.stringify(query));
    } catch {
      const query = {};
      query[key] = val;
      updateSelectedWidgetField("queryJson", JSON.stringify(query));
    }
  };

  // ── Drag Operations ──
  const startDrag = (id, e) => {
    e.preventDefault();
    setSelectedWidgetId(id);
    setActiveDragId(id);
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;

    const startX = e.clientX;
    const startY = e.clientY;
    setDragStartCoord({ x: startX, y: startY });
    setDragOffset({ x: widget.positionX, y: widget.positionY });
  };

  // ── Resize Operations ──
  const startResize = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedWidgetId(id);
    setActiveResizeId(id);
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;

    setDragStartCoord({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ w: widget.width, h: widget.height });
  };

  const handleMouseMove = (e) => {
    if (activeDragId !== null) {
      const deltaX = e.clientX - dragStartCoord.x;
      const deltaY = e.clientY - dragStartCoord.y;

      const gridDeltaX = Math.round(deltaX / canvasCellWidth);
      const gridDeltaY = Math.round(deltaY / gridRowHeight);

      let newX = dragOffset.x + gridDeltaX;
      let newY = dragOffset.y + gridDeltaY;

      // Boundaries checks
      const widget = widgets.find(w => w.id === activeDragId);
      if (widget) {
        newX = Math.max(0, Math.min(gridColumns - widget.width, newX));
        newY = Math.max(0, newY);

        setWidgets(prev => prev.map(w => {
          if (w.id === activeDragId) {
            return { ...w, positionX: newX, positionY: newY };
          }
          return w;
        }));
      }
    }

    if (activeResizeId !== null) {
      const deltaX = e.clientX - dragStartCoord.x;
      const deltaY = e.clientY - dragStartCoord.y;

      const gridDeltaX = Math.round(deltaX / canvasCellWidth);
      const gridDeltaY = Math.round(deltaY / gridRowHeight);

      let newW = resizeStartSize.w + gridDeltaX;
      let newH = resizeStartSize.h + gridDeltaY;

      const widget = widgets.find(w => w.id === activeResizeId);
      if (widget) {
        newW = Math.max(2, Math.min(gridColumns - widget.positionX, newW));
        newH = Math.max(2, newH);

        setWidgets(prev => prev.map(w => {
          if (w.id === activeResizeId) {
            return { ...w, width: newW, height: newH };
          }
          return w;
        }));
      }
    }
  };

  const handleMouseUp = () => {
    setActiveDragId(null);
    setActiveResizeId(null);
  };

  const activeWidget = getSelectedWidget();
  const activeConfig = activeWidget ? JSON.parse(activeWidget.configJson || "{}") : {};
  const activeQuery = activeWidget ? JSON.parse(activeWidget.queryJson || "{}") : {};

  return (
    <div className="bld-root" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <style>{`
        .bld-root {
          display: flex;
          height: calc(100vh - 52px);
          background: #F1F5F9;
          font-family: 'DM Sans', sans-serif;
          user-select: none;
        }
        [data-theme="dark"] .bld-root {
          background: #090F1C;
        }
        
        /* ── Top Bar ── */
        .bld-top {
          position: absolute;
          top: 0; left: 240px; right: 0;
          height: 52px;
          background: #fff;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 200;
        }
        [data-theme="dark"] .bld-top {
          background: #0F172A;
          border-color: #1E293B;
        }
        .bld-top-title {
          font-weight: 800;
          font-size: 15px;
          border: none;
          outline: none;
          color: inherit;
          background: transparent;
          width: 250px;
        }
        .bld-top-title:focus {
          border-bottom: 1.5px solid #059669;
        }
        .top-btn-group {
          display: flex;
          gap: 10px;
        }
        
        /* ── Left Panel ── */
        .bld-left {
          width: 240px;
          background: #fff;
          border-right: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          padding: 16px;
          overflow-y: auto;
        }
        [data-theme="dark"] .bld-left {
          background: #0F172A;
          border-color: #1E293B;
        }
        .left-sec-title {
          font-size: 11px;
          font-weight: 800;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 12px;
        }
        .widget-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          font-size: 12.5px;
          font-weight: 700;
          transition: all 0.12s;
        }
        [data-theme="dark"] .widget-item {
          background: #1E293B;
          border-color: #334155;
        }
        .widget-item:hover {
          transform: translateY(-1px);
          border-color: #0D9488;
          background: rgba(13,148,136,0.05);
        }
        .widget-item-icon {
          font-size: 16px;
        }
        
        /* ── Center Canvas ── */
        .bld-center {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          position: relative;
        }
        .canvas-grid {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          min-height: 800px;
          position: relative;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          background-size: calc(100% / 12) 60px;
          background-image: 
            linear-gradient(to right, rgba(148, 163, 184, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.04) 1px, transparent 1px);
        }
        [data-theme="dark"] .canvas-grid {
          background: #0B132B;
          border-color: #1E293B;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
        
        /* ── Rendered Widget Card ── */
        .canvas-widget {
          position: absolute;
          background: #fff;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(15,23,42,0.05);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        [data-theme="dark"] .canvas-widget {
          background: #0F172A;
          border-color: #1E293B;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .canvas-widget.selected {
          border-color: #0D9488;
          box-shadow: 0 0 0 3px rgba(13,148,136,0.18);
        }
        .widget-hdr {
          padding: 8px 12px;
          background: #F8FAFC;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: move;
        }
        [data-theme="dark"] .widget-hdr {
          background: #1E293B;
          border-color: #334155;
        }
        .widget-hdr-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .widget-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: inherit;
          font-size: 12px;
          color: #64748B;
          flex-direction: column;
          gap: 6px;
        }
        .widget-body-icon {
          font-size: 28px;
          opacity: 0.5;
        }
        .resize-handle {
          position: absolute;
          bottom: 0; right: 0;
          width: 14px; height: 14px;
          cursor: se-resize;
          background: linear-gradient(135deg, transparent 50%, #64748B 50%);
          border-radius: 0 0 10px 0;
        }
        .widget-del-btn {
          background: transparent;
          border: none;
          color: #EF4444;
          font-weight: bold;
          cursor: pointer;
          font-size: 12px;
        }
        
        /* ── Right Panel ── */
        .bld-right {
          width: 280px;
          background: #fff;
          border-left: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          padding: 16px;
          overflow-y: auto;
        }
        [data-theme="dark"] .bld-right {
          background: #0F172A;
          border-color: #1E293B;
        }
        .inp-group {
          margin-bottom: 14px;
        }
        .inp-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        .form-control {
          width: 100%;
          border: 1px solid #CBD5E1;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          background: inherit;
          color: inherit;
          outline: none;
        }
        [data-theme="dark"] .form-control {
          border-color: #334155;
        }
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }
        .preset-color-box {
          height: 32px;
          border-radius: 6px;
          cursor: pointer;
          border: 2px solid transparent;
        }
        .preset-color-box.selected {
          border-color: #000;
        }
        [data-theme="dark"] .preset-color-box.selected {
          border-color: #fff;
        }
      `}</style>

      {/* HEADER TOP BAR */}
      <div className="bld-top">
        <input 
          className="bld-top-title" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Dashboard Title"
        />
        <div className="top-btn-group">
          <button className="btn-sec" onClick={() => navigate("/hospital/analytics")}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save Layout</button>
        </div>
      </div>

      {/* LEFT WIDGET PALETTE */}
      <div className="bld-left" style={{ marginTop: 52 }}>
        <div className="left-sec-title">Standard Widgets</div>
        {WIDGET_TYPES.map(wm => (
          <div key={wm.type} className="widget-item" onClick={() => addWidget(wm)}>
            <span className="widget-item-icon">{wm.icon}</span>
            <span>{wm.label}</span>
          </div>
        ))}
      </div>

      {/* CENTER GRID CANVAS */}
      <div className="bld-center" style={{ marginTop: 52 }}>
        <div ref={canvasRef} className="canvas-grid">
          {widgets.map(w => {
            const left = w.positionX * canvasCellWidth;
            const top = w.positionY * gridRowHeight;
            const width = w.width * canvasCellWidth;
            const height = w.height * gridRowHeight;
            const isSel = w.id === selectedWidgetId;

            const iconObj = WIDGET_TYPES.find(wt => wt.type === w.widgetType);
            const icon = iconObj ? iconObj.icon : "📦";

            return (
              <div 
                key={w.id} 
                className={`canvas-widget${isSel ? " selected" : ""}`}
                style={{
                  left,
                  top,
                  width: width - 4,
                  height: height - 4
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedWidgetId(w.id);
                }}
              >
                <div className="widget-hdr" onMouseDown={(e) => startDrag(w.id, e)}>
                  <span className="widget-hdr-title">{w.widgetTitle}</span>
                  <button className="widget-del-btn" onClick={() => removeWidget(w.id)}>✕</button>
                </div>
                <div className="widget-body">
                  <span className="widget-body-icon">{icon}</span>
                  <span>{w.widgetType.replace("_", " ")}</span>
                  <span style={{ fontSize: 10, opacity: 0.6 }}>Source: {w.dataSource}</span>
                </div>
                
                {/* Resize Handle */}
                <div className="resize-handle" onMouseDown={(e) => startResize(w.id, e)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PROPERTIES PANEL */}
      <div className="bld-right" style={{ marginTop: 52 }}>
        <div className="left-sec-title">Dashboard Settings</div>
        
        <div className="inp-group">
          <label className="inp-label">Description</label>
          <textarea 
            className="form-control" 
            style={{ height: 60, resize: "none" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="inp-group">
          <label className="inp-label">Allowed Access Scoping</label>
          <select className="form-control" value={roleType} onChange={(e) => setRoleType(e.target.value)}>
            <option value="ROLE_ADMIN">ROLE_ADMIN (Super Admin)</option>
            <option value="ROLE_HOSPITAL_ADMIN">ROLE_HOSPITAL_ADMIN (Hospital)</option>
            <option value="ROLE_DOCTOR">ROLE_DOCTOR</option>
            <option value="ROLE_RECEPTIONIST">ROLE_RECEPTIONIST</option>
            <option value="ROLE_BILLING_EXECUTIVE">ROLE_BILLING</option>
            <option value="ROLE_WARD_MANAGER">ROLE_WARD_MANAGER</option>
            <option value="ROLE_FINANCE_ADMIN">ROLE_FINANCE_ADMIN</option>
          </select>
        </div>

        <div className="inp-group">
          <label className="inp-label">Status</label>
          <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="DRAFT">DRAFT (Edit Mode)</option>
            <option value="PUBLISHED">PUBLISHED (Live Mode)</option>
          </select>
        </div>

        <div className="left-sec-title" style={{ marginTop: 24 }}>Widget Properties</div>

        {activeWidget ? (
          <div>
            <div className="inp-group">
              <label className="inp-label">Widget Title</label>
              <input 
                className="form-control" 
                value={activeWidget.widgetTitle}
                onChange={(e) => updateSelectedWidgetField("widgetTitle", e.target.value)}
              />
            </div>

            <div className="inp-group">
              <label className="inp-label">Data Source</label>
              <select 
                className="form-control" 
                value={activeWidget.dataSource}
                onChange={(e) => updateSelectedWidgetField("dataSource", e.target.value)}
              >
                {DATA_SOURCES.map(ds => (
                  <option key={ds.value} value={ds.value}>{ds.label}</option>
                ))}
              </select>
            </div>

            <div className="inp-group">
              <label className="inp-label">Aggregation Metric</label>
              <select 
                className="form-control" 
                value={activeQuery.metric || "COUNT"}
                onChange={(e) => updateSelectedWidgetQueryField("metric", e.target.value)}
              >
                <option value="COUNT">COUNT (Sum quantity / records count)</option>
                <option value="SUM">SUM (Sum value)</option>
                <option value="AVG">AVG (Average)</option>
                <option value="TREND">TREND (Daily timeline trend)</option>
                
                {/* Custom Module Metrics */}
                <option value="REVENUE">REVENUE (Billing revenue total)</option>
                <option value="PENDING">PENDING (Unpaid total / claims)</option>
                <option value="LOW_STOCK">LOW STOCK (Medicines alerts)</option>
                <option value="EXPIRING">EXPIRING (Inventory expiry)</option>
                <option value="GENDER_BREAKDOWN">GENDER_BREAKDOWN (Patients)</option>
                <option value="TYPE_BREAKDOWN">TYPE_BREAKDOWN (Patients)</option>
                <option value="STATUS_BREAKDOWN">STATUS_BREAKDOWN (Appointments)</option>
                <option value="CATEGORY_BREAKDOWN">CATEGORY_BREAKDOWN (Billing categories)</option>
                <option value="SPECIALIZATION_BREAKDOWN">SPECIALIZATION_BREAKDOWN (Doctors)</option>
                <option value="AVAILABILITY">AVAILABILITY (Doctors availability)</option>
                <option value="STOCK_LEVELS">STOCK_LEVELS (Pharmacy stock)</option>
                <option value="CRITICAL">CRITICAL (Critical lab alerts)</option>
              </select>
            </div>

            <div className="inp-group">
              <label className="inp-label">Query Time Range</label>
              <select 
                className="form-control" 
                value={activeQuery.dateRange || "LAST_30_DAYS"}
                onChange={(e) => updateSelectedWidgetQueryField("dateRange", e.target.value)}
              >
                <option value="TODAY">TODAY</option>
                <option value="LAST_7_DAYS">LAST 7 DAYS</option>
                <option value="LAST_30_DAYS">LAST 30 DAYS</option>
                <option value="ALL">ALL TIME</option>
              </select>
            </div>

            <div className="inp-group">
              <label className="inp-label">Color Theme</label>
              <div className="preset-grid">
                {PRESET_COLORS.map(c => (
                  <div 
                    key={c}
                    className={`preset-color-box${activeConfig.color === c ? " selected" : ""}`}
                    style={{ background: c }}
                    onClick={() => updateSelectedWidgetConfigField("color", c)}
                  />
                ))}
              </div>
            </div>

            <div className="inp-group">
              <label className="inp-label">Refresh Period</label>
              <select 
                className="form-control" 
                value={activeConfig.refreshInterval || 300}
                onChange={(e) => updateSelectedWidgetConfigField("refreshInterval", Number(e.target.value))}
              >
                <option value={30}>30 Seconds (Real-time)</option>
                <option value={60}>60 Seconds</option>
                <option value={300}>5 Minutes</option>
                <option value={900}>15 Minutes</option>
                <option value={3600}>1 Hour</option>
              </select>
            </div>
          </div>
        ) : (
          <div style={{ color: "#64748B", fontSize: 12, textAlign: "center", padding: "30px 0" }}>
            Select a widget on the canvas to configure its settings.
          </div>
        )}
      </div>
    </div>
  );
}
