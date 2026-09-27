/**
 * AEGIS - Main Application Bootstrap
 * Orchestrates modules, live overview widgets, network telemetry chart, and simulated heartbeat
 */

window.AEGIS_APP = (function () {
  'use strict';

  let activityCanvas, activityCtx;
  let activityData = [];
  let activityAnimId = null;

  function init() {
    // 1. Initialize Navigation & Router
    window.AEGIS_NAV.init();

    // 2. Initialize Submodules
    window.AEGIS_NETWORK.init();
    window.AEGIS_THREATS.init();
    window.AEGIS_INCIDENTS.init();
    window.AEGIS_ANALYTICS.init();
    window.AEGIS_ENDPOINTS.init();
    window.AEGIS_SETTINGS.init();

    // 3. Initialize Overview Dashboard
    initOverviewDashboard();

    // 4. Setup Keyboard Shortcuts
    setupGlobalShortcuts();

    // 5. Start subtle SOC Telemetry Heartbeat
    startHeartbeatTicker();

    // 6. Deep Linking via URL Search Parameters
    handleUrlSearchDeepLinks();
  }

  function handleUrlSearchDeepLinks() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('threat')) {
      window.AEGIS_NAV.navigateTo('threats');
      setTimeout(() => window.AEGIS_THREATS.inspectThreat(params.get('threat')), 150);
    } else if (params.get('incident')) {
      window.AEGIS_NAV.navigateTo('incidents');
      setTimeout(() => window.AEGIS_INCIDENTS.inspectIncident(params.get('incident')), 150);
    } else if (params.get('endpoint')) {
      window.AEGIS_NAV.navigateTo('endpoints');
      setTimeout(() => window.AEGIS_ENDPOINTS.inspectEndpoint(params.get('endpoint')), 150);
    } else if (params.get('palette') === 'open') {
      setTimeout(() => {
        if (window.AEGIS_NAV && window.AEGIS_NAV.openCommandPalette) {
          window.AEGIS_NAV.openCommandPalette();
        }
      }, 100);
    } else if (params.get('nav') === 'open') {
      setTimeout(() => {
        const trigger = document.getElementById('mobile-menu-trigger');
        if (trigger) trigger.click();
      }, 100);
    }
  }

  /* ==========================================================================
     Overview Dashboard Initialization
     ========================================================================== */
  function initOverviewDashboard() {
    renderOverviewRecentIncidents();
    initNetworkActivityChart();
  }

  function renderOverviewRecentIncidents() {
    const streamContainer = document.getElementById('overview-incident-stream');
    if (!streamContainer) return;

    // Show recent 3 incidents from dataset
    const recent = window.AEGIS_DATA.incidents.slice(0, 3);
    streamContainer.innerHTML = '';

    recent.forEach(inc => {
      const item = document.createElement('div');
      item.className = 'incident-stream-item';

      let badgeClass = 'badge-low';
      if (inc.severity === 'CRITICAL') badgeClass = 'badge-critical';
      else if (inc.severity === 'HIGH') badgeClass = 'badge-high';
      else if (inc.severity === 'MEDIUM') badgeClass = 'badge-medium';

      item.innerHTML = `
        <div class="stream-item-main">
          <span class="stream-item-title">${inc.title}</span>
          <div class="stream-item-meta">
            <span>${inc.id}</span>
            <span>•</span>
            <span>${inc.opened}</span>
            <span>•</span>
            <code>${inc.affectedAssets[0]}</code>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge ${badgeClass}"><span class="badge-dot"></span>${inc.severity}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--text-muted);"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      `;

      item.addEventListener('click', () => {
        window.AEGIS_NAV.navigateTo('incidents');
        setTimeout(() => {
          if (window.AEGIS_INCIDENTS) {
            window.AEGIS_INCIDENTS.inspectIncident(inc.id);
          }
        }, 120);
      });

      streamContainer.appendChild(item);
    });
  }

  /* ==========================================================================
     Overview Network Activity Wave Chart
     ========================================================================== */
  function initNetworkActivityChart() {
    activityCanvas = document.getElementById('overview-activity-chart');
    if (!activityCanvas) return;
    activityCtx = activityCanvas.getContext('2d');

    // Generate initial 30 points
    activityData = [];
    for (let i = 0; i < 35; i++) {
      activityData.push(14000 + Math.random() * 4500 + Math.sin(i / 3) * 2000);
    }

    renderActivityChart();

    window.addEventListener('resize', () => {
      if (window.AEGIS_NAV && window.AEGIS_NAV.getCurrentRoute() === 'overview') {
        renderActivityChart();
      }
    });

    // Update real-time wave every 2 seconds
    setInterval(() => {
      if (window.AEGIS_NAV && window.AEGIS_NAV.getCurrentRoute() === 'overview') {
        const nextVal = 14000 + Math.random() * 4500 + Math.sin(Date.now() / 2000) * 2500;
        activityData.shift();
        activityData.push(nextVal);
        renderActivityChart();
      }
    }, 2000);
  }

  function renderActivityChart() {
    if (!activityCanvas) return;
    const rect = activityCanvas.parentElement.getBoundingClientRect();
    if (rect.width === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = 220;

    activityCanvas.width = w * dpr;
    activityCanvas.height = h * dpr;
    activityCanvas.style.width = `${w}px`;
    activityCanvas.style.height = `${h}px`;

    const ctx = activityCtx;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const padLeft = 45;
    const padRight = 15;
    const padTop = 20;
    const padBottom = 25;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    const minVal = 10000;
    const maxVal = 24000;

    // Draw horizontal guidelines
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const steps = 3;
    for (let i = 0; i <= steps; i++) {
      const v = minVal + (maxVal - minVal) * (i / steps);
      const y = padTop + chartH - (i / steps) * chartH;

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      ctx.fillText(`${(v / 1000).toFixed(0)}k eps`, padLeft - 6, y);
    }

    const points = [];
    const len = activityData.length;
    for (let i = 0; i < len; i++) {
      const x = padLeft + (i / (len - 1)) * chartW;
      const normalized = (activityData[i] - minVal) / (maxVal - minVal);
      const y = padTop + chartH - normalized * chartH;
      points.push({ x, y });
    }

    // Gradient Area Fill
    ctx.beginPath();
    ctx.moveTo(points[0].x, padTop + chartH);
    for (let i = 0; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[points.length - 1].x, padTop + chartH);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    grad.addColorStop(0, 'rgba(0, 242, 254, 0.22)');
    grad.addColorStop(1, 'rgba(0, 242, 254, 0.01)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Line Path
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pulse dot on last point
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00f2fe';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  /* ==========================================================================
     Simulated SOC Heartbeat Ticker
     ========================================================================== */
  function startHeartbeatTicker() {
    setInterval(() => {
      // Subtly randomize ingestion rate slightly to create lifelike SOC monitoring
      const baseEps = 14280 + Math.floor(Math.random() * 80 - 40);
      const epsDisplay = document.getElementById('ticker-eps');
      if (epsDisplay) {
        epsDisplay.textContent = `${baseEps.toLocaleString()} eps`;
      }
    }, 4000);
  }

  /* ==========================================================================
     Global Keyboard Shortcuts
     ========================================================================== */
  function setupGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore if user is inside an input or textarea
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      if (e.key === '1') window.AEGIS_NAV.navigateTo('overview');
      else if (e.key === '2') window.AEGIS_NAV.navigateTo('network');
      else if (e.key === '3') window.AEGIS_NAV.navigateTo('threats');
      else if (e.key === '4') window.AEGIS_NAV.navigateTo('incidents');
      else if (e.key === '5') window.AEGIS_NAV.navigateTo('analytics');
      else if (e.key === '6') window.AEGIS_NAV.navigateTo('endpoints');
      else if (e.key === '7') window.AEGIS_NAV.navigateTo('settings');
    });
  }

  return {
    init
  };
})();

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.AEGIS_APP.init();
});
