/**
 * AEGIS - Endpoint Security Module
 * Enterprise fleet inventory, hardware & telemetry inspector, socket viewer, and host quarantine
 */

window.AEGIS_ENDPOINTS = (function () {
  'use strict';

  let currentSearch = '';
  let currentOs = 'ALL';
  let currentRisk = 'ALL';
  let currentStatus = 'ALL';

  function init() {
    setupFilters();
    renderEndpointsTable();
  }

  function setupFilters() {
    const searchInput = document.getElementById('endpoint-search-input');
    const osSelect = document.getElementById('endpoint-os-select');
    const riskSelect = document.getElementById('endpoint-risk-select');
    const statusSelect = document.getElementById('endpoint-status-select');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        renderEndpointsTable();
      });
    }

    if (osSelect) {
      osSelect.addEventListener('change', (e) => {
        currentOs = e.target.value;
        renderEndpointsTable();
      });
    }

    if (riskSelect) {
      riskSelect.addEventListener('change', (e) => {
        currentRisk = e.target.value;
        renderEndpointsTable();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        currentStatus = e.target.value;
        renderEndpointsTable();
      });
    }
  }

  function getFilteredEndpoints() {
    let list = [...window.AEGIS_DATA.endpoints];

    if (currentSearch) {
      list = list.filter(ep =>
        ep.device.toLowerCase().includes(currentSearch) ||
        ep.ip.toLowerCase().includes(currentSearch) ||
        ep.assignedUser.toLowerCase().includes(currentSearch) ||
        ep.department.toLowerCase().includes(currentSearch)
      );
    }

    if (currentOs !== 'ALL') {
      list = list.filter(ep => ep.os.toLowerCase().includes(currentOs.toLowerCase()));
    }

    if (currentRisk !== 'ALL') {
      list = list.filter(ep => ep.risk.toUpperCase() === currentRisk.toUpperCase());
    }

    if (currentStatus !== 'ALL') {
      list = list.filter(ep => ep.status.toUpperCase() === currentStatus.toUpperCase());
    }

    return list;
  }

  function renderEndpointsTable() {
    const tbody = document.getElementById('endpoints-table-body');
    const countEl = document.getElementById('endpoints-count-badge');
    if (!tbody) return;

    const filtered = getFilteredEndpoints();
    if (countEl) countEl.textContent = `${filtered.length} Managed Devices`;

    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: var(--space-xl); color: var(--text-muted);">
            No endpoint assets match the selected criteria.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(ep => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-device-id', ep.device);

      let riskBadge = 'badge-low';
      if (ep.risk === 'Critical') riskBadge = 'badge-critical';
      else if (ep.risk === 'High') riskBadge = 'badge-high';
      else if (ep.risk === 'Medium') riskBadge = 'badge-medium';

      let statusBadge = 'badge-success';
      if (ep.status === 'Attention') statusBadge = 'badge-high';
      else if (ep.status === 'Isolated') statusBadge = 'badge-critical';

      tr.innerHTML = `
        <td class="primary-cell">
          <div style="display:flex; align-items:center; gap:8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <div style="display:flex; flex-direction:column;">
              <span style="font-weight:600; color:var(--text-primary);">${ep.device}</span>
              <span style="font-family:var(--font-mono); font-size:11px; color:var(--text-muted);">${ep.ip}</span>
            </div>
          </div>
        </td>
        <td>
          <span style="font-size:var(--text-xs); color:var(--text-secondary);">${ep.type}</span>
        </td>
        <td>
          <span style="font-size:var(--text-xs); color:var(--text-primary);">${ep.os}</span>
        </td>
        <td>
          <span class="badge ${riskBadge}"><span class="badge-dot"></span>${ep.risk}</span>
        </td>
        <td>
          <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted);">${ep.lastSeen}</span>
        </td>
        <td>
          <span class="badge ${statusBadge}">${ep.status}</span>
        </td>
      `;

      tr.addEventListener('click', () => {
        inspectEndpoint(ep.device);
      });

      tbody.appendChild(tr);
    });
  }

  function inspectEndpoint(deviceName) {
    const ep = window.AEGIS_DATA.endpoints.find(e => e.device === deviceName);
    if (!ep) return;

    let riskBadge = 'badge-low';
    if (ep.risk === 'Critical') riskBadge = 'badge-critical';
    else if (ep.risk === 'High') riskBadge = 'badge-high';
    else if (ep.risk === 'Medium') riskBadge = 'badge-medium';

    let statusBadge = 'badge-success';
    if (ep.status === 'Attention') statusBadge = 'badge-high';
    else if (ep.status === 'Isolated') statusBadge = 'badge-critical';

    const isIsolated = ep.status === 'Isolated';

    const bodyHtml = `
      <!-- Device Header Card -->
      <div class="card" style="background:var(--bg-surface); padding:var(--space-md); margin-bottom:var(--space-md);">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-sm); font-size:var(--text-xs);">
          <div>
            <span style="color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">Asset Identifier</span>
            <p style="color:var(--text-primary); font-family:var(--font-mono); font-weight:600; margin-top:2px;">${ep.device}</p>
          </div>
          <div>
            <span style="color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">Host Status</span>
            <div style="margin-top:2px;"><span class="badge ${statusBadge}">${ep.status}</span></div>
          </div>
          <div>
            <span style="color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">IP & MAC Address</span>
            <p style="color:var(--accent-blue); font-family:var(--font-mono); margin-top:2px;">${ep.ip} <br><span style="color:var(--text-muted); font-size:10px;">${ep.mac}</span></p>
          </div>
          <div>
            <span style="color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">Assigned Principal</span>
            <p style="color:var(--text-primary); margin-top:2px;">${ep.assignedUser}</p>
          </div>
          <div>
            <span style="color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">Operating System</span>
            <p style="color:var(--text-primary); margin-top:2px;">${ep.os}</p>
          </div>
          <div>
            <span style="color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">EDR Agent Telemetry</span>
            <p style="color:var(--color-success); font-family:var(--font-mono); margin-top:2px;">${ep.agentVersion}</p>
          </div>
        </div>
      </div>

      <!-- Open Network Sockets -->
      <div style="margin-bottom:var(--space-md);">
        <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase;">Active Network Sockets</span>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
          ${ep.openSockets.map(sock => `<code style="font-size:var(--text-xs); ${sock.includes('Flagged') ? 'color:var(--color-critical); border-color:rgba(239,68,68,0.4); background:rgba(239,68,68,0.08);' : ''}">${sock}</code>`).join('')}
        </div>
      </div>

      <!-- Active Running Processes Telemetry -->
      <div>
        <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase;">Process Execution Table</span>
        <div style="margin-top:6px; display:flex; flex-direction:column; gap:6px;">
          ${ep.processes.map(proc => `
            <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px; display:flex; align-items:center; justify-content:space-between; font-size:var(--text-xs);">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-family:var(--font-mono); font-weight:600; color:${proc.status === 'SUSPENDED' ? 'var(--color-critical)' : 'var(--text-primary)'};">${proc.name}</span>
                <span style="font-family:var(--font-mono); color:var(--text-muted);">PID: ${proc.pid}</span>
              </div>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="color:var(--text-muted); font-size:10px;">${proc.signer}</span>
                <span class="badge ${proc.status === 'SUSPENDED' ? 'badge-critical' : 'badge-neutral'}">${proc.status}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary btn-sm" id="btn-scan-endpoint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>
        Trigger Memory Scan
      </button>
      <button class="btn ${isIsolated ? 'btn-secondary' : 'btn-danger'} btn-sm" id="btn-isolate-endpoint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        ${isIsolated ? 'Restore Network Access' : 'Enforce Network Isolation'}
      </button>
    `;

    window.AEGIS_NAV.openSlideover(
      ep.device,
      `${ep.type} • ${ep.assignedUser}`,
      bodyHtml,
      footerHtml
    );

    const isolateBtn = document.getElementById('btn-isolate-endpoint');
    const scanBtn = document.getElementById('btn-scan-endpoint');

    if (isolateBtn) {
      isolateBtn.addEventListener('click', () => {
        if (ep.status === 'Isolated') {
          ep.status = 'Protected';
          ep.risk = 'Low';
          window.AEGIS_NAV.showToast(`Device ${ep.device} network connectivity restored.`, 'info');
        } else {
          ep.status = 'Isolated';
          window.AEGIS_NAV.showToast(`NDIS driver isolation applied to ${ep.device}. Host quarantined.`, 'critical');
        }
        renderEndpointsTable();
        window.AEGIS_NAV.closeSlideover();
      });
    }

    if (scanBtn) {
      scanBtn.addEventListener('click', () => {
        window.AEGIS_NAV.showToast(`Deep memory and volatility analysis initiated on ${ep.device}`, 'info');
      });
    }
  }

  return {
    init,
    renderEndpointsTable,
    inspectEndpoint
  };
})();
