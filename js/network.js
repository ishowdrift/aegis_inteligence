/**
 * AEGIS - Network Intelligence Topology Visualization
 * Interactive Canvas with animated packet flows, node selection, pan/zoom, and inspector
 */

window.AEGIS_NETWORK = (function () {
  'use strict';

  let canvas, ctx;
  let animationFrameId = null;
  let isRunning = false;

  let width = 0;
  let height = 0;
  let dpr = 1;

  // Viewport transformation
  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0, startY = 0;

  let activeFilter = 'ALL'; // ALL, INTERNAL, EXTERNAL, CRITICAL
  let selectedNodeId = 'ext-1';
  let hoveredNodeId = null;

  // Packet animation particles
  let particles = [];

  function init() {
    canvas = document.getElementById('network-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    setupListeners();
    initParticles();
    resizeCanvas();
    updateInspector(selectedNodeId);
  }

  function onEnter() {
    resizeCanvas();
    if (!isRunning) {
      isRunning = true;
      animate();
    }
  }

  function onLeave() {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Center layout by default if not set
    if (panX === 0 && panY === 0) {
      resetView();
    }
  }

  function resetView() {
    scale = Math.min(width / 1150, height / 640);
    scale = Math.max(0.65, Math.min(scale, 1.25));
    panX = (width - 1050 * scale) / 2;
    panY = (height - 580 * scale) / 2;
  }

  function initParticles() {
    particles = [];
    const connections = window.AEGIS_DATA.networkTopology.connections;
    connections.forEach((conn, index) => {
      // Create 2 particles per connection
      for (let i = 0; i < 2; i++) {
        particles.push({
          connIndex: index,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.004,
          size: 2.5
        });
      }
    });
  }

  function setupListeners() {
    window.addEventListener('resize', () => {
      if (window.AEGIS_NAV && window.AEGIS_NAV.getCurrentRoute() === 'network') {
        resizeCanvas();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        onLeave();
      } else if (window.AEGIS_NAV && window.AEGIS_NAV.getCurrentRoute() === 'network') {
        onEnter();
      }
    });

    // Pan & Drag handlers
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        panX = e.clientX - startX;
        panY = e.clientY - startY;
      } else if (canvas && canvas.parentElement.contains(e.target)) {
        handleHover(e);
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support for mobile/tablet
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - panX;
        startY = e.touches[0].clientY - panY;
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        panX = e.touches[0].clientX - startX;
        panY = e.touches[0].clientY - startY;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Click to select node
    canvas.addEventListener('click', (e) => {
      const node = getNodeAtPosition(e.clientX, e.clientY);
      if (node) {
        selectedNodeId = node.id;
        updateInspector(node.id);
        window.AEGIS_NAV.playSocChime('click');
      }
    });

    // Zoom controls
    const zoomInBtn = document.getElementById('net-zoom-in');
    const zoomOutBtn = document.getElementById('net-zoom-out');
    const zoomResetBtn = document.getElementById('net-zoom-reset');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        scale = Math.min(scale * 1.2, 2.2);
      });
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        scale = Math.max(scale / 1.2, 0.45);
      });
    }
    if (zoomResetBtn) {
      zoomResetBtn.addEventListener('click', resetView);
    }

    // Filter pill buttons
    document.querySelectorAll('.network-filter-pills .filter-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.network-filter-pills .filter-pill-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeFilter = btn.getAttribute('data-filter') || 'ALL';
        window.AEGIS_NAV.playSocChime('click');
      });
    });
  }

  function handleHover(e) {
    const node = getNodeAtPosition(e.clientX, e.clientY);
    hoveredNodeId = node ? node.id : null;
    canvas.style.cursor = node ? 'pointer' : (isDragging ? 'grabbing' : 'grab');
  }

  function getNodeAtPosition(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const nodes = getFilteredNodes();
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const screenX = panX + node.x * scale;
      const screenY = panY + node.y * scale;
      const radius = 22 * scale;

      const dist = Math.hypot(mouseX - screenX, mouseY - screenY);
      if (dist <= radius) {
        return node;
      }
    }
    return null;
  }

  function getFilteredNodes() {
    const allNodes = window.AEGIS_DATA.networkTopology.nodes;
    if (activeFilter === 'ALL') return allNodes;
    if (activeFilter === 'INTERNAL') {
      return allNodes.filter(n => n.tier !== 'external');
    }
    if (activeFilter === 'EXTERNAL') {
      return allNodes.filter(n => n.tier === 'external');
    }
    if (activeFilter === 'CRITICAL') {
      return allNodes.filter(n => n.status === 'critical' || n.risk >= 80);
    }
    return allNodes;
  }

  function updateInspector(nodeId) {
    const node = window.AEGIS_DATA.networkTopology.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const assetEl = document.getElementById('inspector-asset');
    const ipEl = document.getElementById('inspector-ip');
    const tierEl = document.getElementById('inspector-tier');
    const statusEl = document.getElementById('inspector-status');
    const riskEl = document.getElementById('inspector-risk');
    const trafficEl = document.getElementById('inspector-traffic');
    const peersEl = document.getElementById('inspector-peers');
    const actionsContainer = document.getElementById('inspector-actions');

    if (assetEl) assetEl.textContent = node.label;
    if (ipEl) ipEl.textContent = node.ip;
    if (tierEl) tierEl.textContent = `${node.type} (${node.tier.toUpperCase()})`;
    if (trafficEl) trafficEl.textContent = node.traffic;
    if (peersEl) peersEl.textContent = `${node.connections ? node.connections.length : 1} Active Links`;

    if (statusEl) {
      let badgeClass = 'badge-success';
      if (node.status === 'critical') badgeClass = 'badge-critical';
      else if (node.status === 'warning') badgeClass = 'badge-high';
      statusEl.className = `badge ${badgeClass}`;
      statusEl.textContent = node.status.toUpperCase();
    }

    if (riskEl) {
      riskEl.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
          <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted);">Risk Index</span>
          <span style="font-family:var(--font-mono); font-size:var(--text-xs); font-weight:700; color:${node.risk >= 80 ? 'var(--color-critical)' : (node.risk >= 50 ? 'var(--color-high)' : 'var(--color-success)')};">${node.risk}/100</span>
        </div>
        <div style="height:6px; background:var(--bg-surface); border-radius:99px; overflow:hidden;">
          <div style="width:${node.risk}%; height:100%; background:${node.risk >= 80 ? 'var(--color-critical)' : (node.risk >= 50 ? 'var(--color-high)' : 'var(--color-success)')}; border-radius:99px;"></div>
        </div>
      `;
    }

    if (actionsContainer) {
      actionsContainer.innerHTML = `
        <button class="btn btn-secondary btn-sm" id="btn-inspect-flows" style="width:100%;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Inspect Packet Telemetry
        </button>
        <button class="btn ${node.status === 'critical' ? 'btn-danger' : 'btn-ghost'} btn-sm" id="btn-quarantine-node" style="width:100%;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          ${node.status === 'critical' ? 'Apply Host Quarantine' : 'Verify Route Integrity'}
        </button>
      `;

      const inspectBtn = document.getElementById('btn-inspect-flows');
      const quarantineBtn = document.getElementById('btn-quarantine-node');

      if (inspectBtn) {
        inspectBtn.addEventListener('click', () => {
          window.AEGIS_NAV.showToast(`Active telemetry captured for ${node.label} (${node.ip}): 0 dropped frames`, 'info');
        });
      }
      if (quarantineBtn) {
        quarantineBtn.addEventListener('click', () => {
          if (node.status === 'critical') {
            node.status = 'warning';
            node.risk = Math.max(30, node.risk - 40);
            updateInspector(node.id);
            window.AEGIS_NAV.showToast(`Host ${node.label} isolated from external gateway. Risk score mitigated.`, 'success');
          } else {
            window.AEGIS_NAV.showToast(`Route integrity verified for ${node.label}. MTU 1500 MSS OK.`, 'info');
          }
        });
      }
    }
  }

  /* ==========================================================================
     Animation and Render Loop
     ========================================================================== */
  function animate() {
    if (!isRunning) return;

    render();
    animationFrameId = requestAnimationFrame(animate);
  }

  function render() {
    if (!ctx) return;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Draw background subtle grid inside canvas
    drawCanvasGrid();

    const nodes = window.AEGIS_DATA.networkTopology.nodes;
    const connections = window.AEGIS_DATA.networkTopology.connections;
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // 1. Draw Connections
    connections.forEach((conn, index) => {
      const fromNode = nodeMap.get(conn.from);
      const toNode = nodeMap.get(conn.to);
      if (!fromNode || !toNode) return;

      const x1 = panX + fromNode.x * scale;
      const y1 = panY + fromNode.y * scale;
      const x2 = panX + toNode.x * scale;
      const y2 = panY + toNode.y * scale;

      const isConnectedToSelected = (fromNode.id === selectedNodeId || toNode.id === selectedNodeId);
      const isConnectedToHovered = (fromNode.id === hoveredNodeId || toNode.id === hoveredNodeId);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      if (conn.status === 'critical') {
        ctx.strokeStyle = isConnectedToSelected ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = (isConnectedToSelected ? 2.5 : 1.5) * scale;
        ctx.setLineDash([4 * scale, 3 * scale]);
      } else if (conn.status === 'warning') {
        ctx.strokeStyle = isConnectedToSelected ? 'rgba(245, 158, 11, 0.9)' : 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = (isConnectedToSelected ? 2 : 1.2) * scale;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = isConnectedToSelected ? 'rgba(0, 242, 254, 0.7)' : (isConnectedToHovered ? 'rgba(0, 242, 254, 0.5)' : 'rgba(255, 255, 255, 0.1)');
        ctx.lineWidth = (isConnectedToSelected ? 2 : 1) * scale;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 2. Draw Moving Packet Particles
    particles.forEach(p => {
      const conn = connections[p.connIndex];
      if (!conn) return;

      const fromNode = nodeMap.get(conn.from);
      const toNode = nodeMap.get(conn.to);
      if (!fromNode || !toNode) return;

      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;

      const x1 = panX + fromNode.x * scale;
      const y1 = panY + fromNode.y * scale;
      const x2 = panX + toNode.x * scale;
      const y2 = panY + toNode.y * scale;

      const px = x1 + (x2 - x1) * p.progress;
      const py = y1 + (y2 - y1) * p.progress;

      ctx.beginPath();
      ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);

      if (conn.status === 'critical') {
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
      } else if (conn.status === 'warning') {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
      } else {
        ctx.fillStyle = '#00f2fe';
        ctx.shadowColor = '#00f2fe';
      }
      ctx.shadowBlur = 6 * scale;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 3. Draw Nodes
    const filteredNodes = getFilteredNodes();
    nodes.forEach(node => {
      const isFilteredOut = !filteredNodes.some(fn => fn.id === node.id);
      const isSelected = (node.id === selectedNodeId);
      const isHovered = (node.id === hoveredNodeId);

      const nx = panX + node.x * scale;
      const ny = panY + node.y * scale;
      const baseRadius = (isSelected ? 22 : (isHovered ? 20 : 16)) * scale;

      ctx.save();
      if (isFilteredOut) {
        ctx.globalAlpha = 0.15;
      }

      // Outer Selection Glow Ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(nx, ny, baseRadius + 7 * scale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nx, ny, baseRadius + 12 * scale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
      }

      // Base Node Circle
      ctx.beginPath();
      ctx.arc(nx, ny, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#162238' : '#0c1322';
      ctx.fill();

      // Border Color based on status
      let statusColor = '#10b981';
      if (node.status === 'critical') statusColor = '#ef4444';
      else if (node.status === 'warning') statusColor = '#f59e0b';

      ctx.strokeStyle = isSelected ? '#00f2fe' : statusColor;
      ctx.lineWidth = (isSelected ? 2.5 : 1.5) * scale;
      ctx.stroke();

      // Inner Status Center Dot
      ctx.beginPath();
      ctx.arc(nx, ny, 4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = statusColor;
      ctx.shadowColor = statusColor;
      ctx.shadowBlur = (node.status === 'critical' ? 8 : 4) * scale;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Node Label
      ctx.font = `${Math.max(10, Math.round(11 * scale))}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isSelected ? '#ffffff' : (isHovered ? '#00f2fe' : '#94a3b8');
      ctx.fillText(node.label, nx, ny + baseRadius + 6 * scale);

      // Node IP subtext
      if (scale >= 0.75) {
        ctx.font = `${Math.max(9, Math.round(9.5 * scale))}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = '#64748b';
        ctx.fillText(node.ip, nx, ny + baseRadius + 19 * scale);
      }

      ctx.restore();
    });

    ctx.restore();
  }

  function drawCanvasGrid() {
    const gridSize = 40 * scale;
    const startGridX = panX % gridSize;
    const startGridY = panY % gridSize;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;

    for (let x = startGridX; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = startGridY; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  return {
    init,
    onEnter,
    onLeave,
    selectNode: (id) => {
      selectedNodeId = id;
      updateInspector(id);
    }
  };
})();
