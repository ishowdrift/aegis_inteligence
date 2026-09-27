/**
 * AEGIS - Security Analytics Module
 * High-performance lightweight Canvas charts, multi-series area plots, and dynamic date filters
 */

window.AEGIS_ANALYTICS = (function () {
  'use strict';

  let currentRange = '24H';
  let timelineCanvas, timelineCtx;
  let hoveredPoint = null;

  function init() {
    timelineCanvas = document.getElementById('analytics-timeline-chart');
    if (timelineCanvas) {
      timelineCtx = timelineCanvas.getContext('2d');
      setupTimelineHover();
    }
    setupRangeButtons();
    renderAllCharts();
  }

  function setupRangeButtons() {
    document.querySelectorAll('.analytics-range-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.analytics-range-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentRange = btn.getAttribute('data-range') || '24H';
        renderAllCharts();
        window.AEGIS_NAV.playSocChime('click');
      });
    });

    window.addEventListener('resize', () => {
      if (window.AEGIS_NAV && window.AEGIS_NAV.getCurrentRoute() === 'analytics') {
        renderTimelineChart();
      }
    });
  }

  function renderAllCharts() {
    const data = window.AEGIS_DATA.analyticsData[currentRange];
    if (!data) return;

    renderMetricCards(data.summary);
    renderTimelineChart();
    renderEventCategories(data.eventCategories);
    renderAttackVectors(data.attackVectors);
    renderEndpointPosture(data.endpointHealthBreakdown);
  }

  function renderMetricCards(summary) {
    const totalEl = document.getElementById('analytics-total-threats');
    const blockedEl = document.getElementById('analytics-blocked-threats');
    const eventsEl = document.getElementById('analytics-events-analyzed');
    const mttrEl = document.getElementById('analytics-mttr');
    const mttrChangeEl = document.getElementById('analytics-mttr-change');

    if (totalEl) totalEl.textContent = summary.totalThreats.toLocaleString();
    if (blockedEl) blockedEl.textContent = `${summary.blockRate} (${summary.blockedThreats.toLocaleString()})`;
    if (eventsEl) eventsEl.textContent = summary.eventsAnalyzed;
    if (mttrEl) mttrEl.textContent = summary.mttrAvg;
    if (mttrChangeEl) {
      mttrChangeEl.textContent = summary.mttrChange;
      mttrChangeEl.className = 'metric-trend trend-positive';
    }
  }

  /* ==========================================================================
     Canvas Timeline Chart (Blocked vs Investigated Threats Area Plot)
     ========================================================================== */
  function renderTimelineChart() {
    if (!timelineCanvas) {
      timelineCanvas = document.getElementById('analytics-timeline-chart');
      if (!timelineCanvas) return;
      timelineCtx = timelineCanvas.getContext('2d');
    }

    const rect = timelineCanvas.parentElement.getBoundingClientRect();
    if (rect.width === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = 260;

    timelineCanvas.width = w * dpr;
    timelineCanvas.height = h * dpr;
    timelineCanvas.style.width = `${w}px`;
    timelineCanvas.style.height = `${h}px`;

    const ctx = timelineCtx;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const data = window.AEGIS_DATA.analyticsData[currentRange];
    const series = data.threatTimeline;
    const len = series.length;
    if (len < 2) {
      ctx.restore();
      return;
    }

    const padLeft = 40;
    const padRight = 20;
    const padTop = 30;
    const padBottom = 35;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    // Determine max value for Y-axis
    let maxVal = 0;
    series.forEach(item => {
      const val = item.blocked + item.investigated;
      if (val > maxVal) maxVal = val;
    });
    maxVal = Math.ceil(maxVal * 1.2 / 5) * 5 || 10;

    // Draw horizontal grid lines & Y labels
    const gridLines = 4;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#64748b';

    for (let i = 0; i <= gridLines; i++) {
      const yVal = Math.round((maxVal / gridLines) * i);
      const yPos = padTop + chartH - (i / gridLines) * chartH;

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(w - padRight, yPos);
      ctx.stroke();

      ctx.fillText(yVal, padLeft - 8, yPos);
    }

    // Coordinates for points
    const pointsBlocked = [];
    const pointsInvestigated = [];

    series.forEach((item, idx) => {
      const x = padLeft + (idx / (len - 1)) * chartW;
      const yB = padTop + chartH - (item.blocked / maxVal) * chartH;
      const yI = padTop + chartH - (item.investigated / maxVal) * chartH;

      pointsBlocked.push({ x, y: yB, val: item.blocked, time: item.time });
      pointsInvestigated.push({ x, y: yI, val: item.investigated, time: item.time });

      // Draw X-axis label
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.fillText(item.time, x, h - 12);
    });

    // 1. Draw Blocked Threats Gradient Area
    ctx.beginPath();
    ctx.moveTo(pointsBlocked[0].x, padTop + chartH);
    pointsBlocked.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(pointsBlocked[len - 1].x, padTop + chartH);
    ctx.closePath();

    const areaGrad = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    areaGrad.addColorStop(0, 'rgba(0, 242, 254, 0.28)');
    areaGrad.addColorStop(1, 'rgba(0, 242, 254, 0.01)');
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // 2. Draw Blocked Threats Line
    ctx.beginPath();
    pointsBlocked.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. Draw Investigated Threats Line
    ctx.beginPath();
    pointsInvestigated.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Draw Points & Hover Highlight
    pointsBlocked.forEach((pt, idx) => {
      const isHovered = hoveredPoint === idx;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isHovered ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#080d16';
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      const ptI = pointsInvestigated[idx];
      ctx.beginPath();
      ctx.arc(ptI.x, ptI.y, isHovered ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Tooltip box if hovered
      if (isHovered) {
        ctx.save();
        const tooltipX = Math.min(Math.max(pt.x, 80), w - 80);
        const tooltipY = Math.max(pt.y - 45, 10);

        ctx.fillStyle = '#0d131f';
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tooltipX - 70, tooltipY, 140, 36, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(`${pt.time}: ${pt.val} Blk | ${ptI.val} Inv`, tooltipX, tooltipY + 20);
        ctx.restore();
      }
    });

    ctx.restore();
  }

  function setupTimelineHover() {
    timelineCanvas.addEventListener('mousemove', (e) => {
      const rect = timelineCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      const data = window.AEGIS_DATA.analyticsData[currentRange];
      const series = data.threatTimeline;
      const len = series.length;
      const padLeft = 40;
      const padRight = 20;
      const chartW = rect.width - padLeft - padRight;

      let closestIdx = -1;
      let minDistance = 30;

      series.forEach((_, idx) => {
        const x = padLeft + (idx / (len - 1)) * chartW;
        const dist = Math.abs(mouseX - x);
        if (dist < minDistance) {
          closestIdx = idx;
          minDistance = dist;
        }
      });

      if (hoveredPoint !== closestIdx) {
        hoveredPoint = closestIdx;
        renderTimelineChart();
      }
    });

    timelineCanvas.addEventListener('mouseleave', () => {
      if (hoveredPoint !== null) {
        hoveredPoint = null;
        renderTimelineChart();
      }
    });
  }

  /* ==========================================================================
     Security Events Breakdown
     ========================================================================== */
  function renderEventCategories(categories) {
    const container = document.getElementById('analytics-categories-list');
    if (!container) return;

    container.innerHTML = categories.map(cat => `
      <div class="category-bar-item">
        <div class="category-bar-meta">
          <span class="category-bar-name">${cat.label}</span>
          <span class="category-bar-val">${cat.count.toLocaleString()} (${cat.percentage}%)</span>
        </div>
        <div class="category-bar-track">
          <div class="category-bar-fill" style="width: ${cat.percentage}%; background-color: ${cat.color};"></div>
        </div>
      </div>
    `).join('');
  }

  /* ==========================================================================
     Attack Vectors Ranked
     ========================================================================== */
  function renderAttackVectors(vectors) {
    const container = document.getElementById('analytics-vectors-list');
    if (!container) return;

    container.innerHTML = vectors.map(vec => `
      <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:10px 14px; display:flex; align-items:center; justify-content:space-between;">
        <div>
          <span style="font-weight:600; color:var(--text-primary); font-size:var(--text-sm);">${vec.name}</span>
          <div style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); margin-top:2px;">Volume: ${vec.count} events</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:80px; height:6px; background:var(--bg-app); border-radius:99px; overflow:hidden;">
            <div style="width:${vec.score}%; height:100%; background:${vec.score > 75 ? 'var(--color-critical)' : 'var(--accent-cyan)'}; border-radius:99px;"></div>
          </div>
          <span style="font-family:var(--font-mono); font-size:var(--text-xs); font-weight:700; color:${vec.score > 75 ? 'var(--color-critical)' : 'var(--accent-cyan)'}; min-width:32px; text-align:right;">${vec.score}</span>
        </div>
      </div>
    `).join('');
  }

  /* ==========================================================================
     Endpoint Posture
     ========================================================================== */
  function renderEndpointPosture(posture) {
    const healthyEl = document.getElementById('posture-healthy');
    const warningEl = document.getElementById('posture-warning');
    const criticalEl = document.getElementById('posture-critical');

    if (healthyEl) healthyEl.textContent = posture.healthy;
    if (warningEl) warningEl.textContent = posture.warning;
    if (criticalEl) criticalEl.textContent = posture.critical;
  }

  return {
    init,
    renderAllCharts
  };
})();
