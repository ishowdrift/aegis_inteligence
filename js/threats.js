/**
 * AEGIS - Threat Intelligence Module
 * Filterable, searchable threat table and detailed slideover inspection panel
 */

window.AEGIS_THREATS = (function () {
  'use strict';

  let currentSearch = '';
  let currentSeverity = 'ALL';
  let currentStatus = 'ALL';
  let currentSort = 'time-desc';

  function init() {
    setupFilters();
    renderThreatsTable();
  }

  function setupFilters() {
    const searchInput = document.getElementById('threat-search-input');
    const severitySelect = document.getElementById('threat-severity-select');
    const statusSelect = document.getElementById('threat-status-select');
    const sortSelect = document.getElementById('threat-sort-select');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        renderThreatsTable();
      });
    }

    if (severitySelect) {
      severitySelect.addEventListener('change', (e) => {
        currentSeverity = e.target.value;
        renderThreatsTable();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        currentStatus = e.target.value;
        renderThreatsTable();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderThreatsTable();
      });
    }
  }

  function getFilteredThreats() {
    let list = [...window.AEGIS_DATA.threats];

    // Search filter
    if (currentSearch) {
      list = list.filter(t => 
        t.title.toLowerCase().includes(currentSearch) ||
        t.id.toLowerCase().includes(currentSearch) ||
        t.source.toLowerCase().includes(currentSearch) ||
        t.target.toLowerCase().includes(currentSearch)
      );
    }

    // Severity filter
    if (currentSeverity !== 'ALL') {
      list = list.filter(t => t.severity === currentSeverity);
    }

    // Status filter
    if (currentStatus !== 'ALL') {
      list = list.filter(t => t.status === currentStatus);
    }

    // Sort
    if (currentSort === 'severity') {
      const rank = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      list.sort((a, b) => (rank[b.severity] || 0) - (rank[a.severity] || 0));
    } else {
      // By detected time (array order is chronological descending)
      list.sort((a, b) => b.riskScore - a.riskScore);
    }

    return list;
  }

  function renderThreatsTable() {
    const tbody = document.getElementById('threats-table-body');
    const countEl = document.getElementById('threats-count-badge');
    if (!tbody) return;

    const filtered = getFilteredThreats();
    if (countEl) countEl.textContent = `${filtered.length} Detections`;

    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: var(--space-xl); color: var(--text-muted);">
            No threats match the current query criteria.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(threat => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-threat-id', threat.id);

      let sevClass = 'badge-low';
      if (threat.severity === 'CRITICAL') sevClass = 'badge-critical';
      else if (threat.severity === 'HIGH') sevClass = 'badge-high';
      else if (threat.severity === 'MEDIUM') sevClass = 'badge-medium';

      let statusBadge = 'badge-neutral';
      if (threat.status === 'INVESTIGATING') statusBadge = 'badge-high';
      else if (threat.status === 'CONTAINED') statusBadge = 'badge-success';
      else if (threat.status === 'MITIGATED') statusBadge = 'badge-low';

      tr.innerHTML = `
        <td class="primary-cell">
          <div style="display:flex; flex-direction:column; gap:2px;">
            <span style="font-weight:600; color:var(--text-primary);">${threat.title}</span>
            <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted);">${threat.id}</span>
          </div>
        </td>
        <td>
          <span class="badge ${sevClass}">
            <span class="badge-dot"></span>
            ${threat.severity}
          </span>
        </td>
        <td>
          <div style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-secondary); max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${threat.source}
          </div>
        </td>
        <td>
          <code>${threat.target}</code>
        </td>
        <td>
          <div style="display:flex; flex-direction:column;">
            <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-primary);">${threat.detected}</span>
            <span style="font-size:var(--text-xs); color:var(--text-muted);">${threat.relativeTime}</span>
          </div>
        </td>
        <td>
          <span class="badge ${statusBadge}">${threat.status}</span>
        </td>
      `;

      tr.addEventListener('click', () => {
        inspectThreat(threat.id);
      });

      tbody.appendChild(tr);
    });
  }

  function inspectThreat(threatId) {
    const threat = window.AEGIS_DATA.threats.find(t => t.id === threatId);
    if (!threat) return;

    let sevBadge = 'badge-low';
    if (threat.severity === 'CRITICAL') sevBadge = 'badge-critical';
    else if (threat.severity === 'HIGH') sevBadge = 'badge-high';
    else if (threat.severity === 'MEDIUM') sevBadge = 'badge-medium';

    const bodyHtml = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-md);">
        <div style="display:flex; align-items:center; gap:var(--space-sm);">
          <span class="badge ${sevBadge}"><span class="badge-dot"></span>${threat.severity}</span>
          <span class="badge badge-neutral">${threat.status}</span>
        </div>
        <div style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted);">
          Risk Score: <strong style="color:var(--text-primary); font-size:var(--text-sm);">${threat.riskScore}/100</strong>
        </div>
      </div>

      <div class="card" style="background:var(--bg-surface); padding:var(--space-md); margin-bottom:var(--space-md);">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-md); font-size:var(--text-xs);">
          <div>
            <span style="color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">Source</span>
            <p style="color:var(--text-primary); font-family:var(--font-mono); margin-top:2px;">${threat.source}</p>
          </div>
          <div>
            <span style="color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">Target Asset</span>
            <p style="color:var(--accent-blue); font-family:var(--font-mono); margin-top:2px;">${threat.target} (${threat.targetIp})</p>
          </div>
        </div>
      </div>

      <!-- MITRE Box -->
      <div class="mitre-box" style="margin-bottom:var(--space-md);">
        <div class="mitre-tactic">${threat.mitre.tactic}</div>
        <div class="mitre-technique">${threat.mitre.technique}</div>
      </div>

      <!-- Description -->
      <div style="margin-bottom:var(--space-md);">
        <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase;">Technical Narrative</span>
        <p style="font-size:var(--text-sm); color:var(--text-primary); line-height:1.6; margin-top:6px;">${threat.description}</p>
      </div>

      <!-- IoCs -->
      <div style="margin-bottom:var(--space-md);">
        <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase;">Indicators of Compromise (IoCs)</span>
        <div class="ioc-pill-list">
          ${threat.iocs.map(ioc => `<span class="ioc-pill"><strong>${ioc.type}:</strong> ${ioc.value}</span>`).join('')}
        </div>
      </div>

      <!-- Timeline -->
      <div style="margin-bottom:var(--space-md);">
        <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase;">Forensic Timeline</span>
        <div class="investigation-timeline" style="margin-top:var(--space-sm);">
          ${threat.timeline.map(step => `
            <div class="timeline-step">
              <span class="timeline-dot"></span>
              <span class="timeline-time">${step.time}</span>
              <p class="timeline-text">${step.event}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Remediation Recommendations -->
      <div>
        <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase;">Recommended Containment Procedures</span>
        <ul style="list-style:none; margin-top:8px; display:flex; flex-direction:column; gap:6px;">
          ${threat.remediationSteps.map(step => `
            <li style="display:flex; align-items:flex-start; gap:8px; font-size:var(--text-xs); color:var(--text-secondary);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${step}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary btn-sm" id="btn-export-stix">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export STIX 2.1
      </button>
      <button class="btn btn-primary btn-sm" id="btn-contain-threat">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Enforce Containment
      </button>
    `;

    window.AEGIS_NAV.openSlideover(
      threat.title,
      `${threat.id} — Detected at ${threat.detected}`,
      bodyHtml,
      footerHtml
    );

    // Bind action buttons in slideover footer
    const containBtn = document.getElementById('btn-contain-threat');
    const exportBtn = document.getElementById('btn-export-stix');

    if (containBtn) {
      containBtn.addEventListener('click', () => {
        threat.status = 'CONTAINED';
        renderThreatsTable();
        window.AEGIS_NAV.showToast(`Automated containment applied to ${threat.target}. Threat ${threat.id} status set to CONTAINED.`, 'success');
        window.AEGIS_NAV.closeSlideover();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        window.AEGIS_NAV.showToast(`STIX 2.1 JSON bundle generated and ready for SIEM ingestion (${threat.id})`, 'info');
      });
    }
  }

  return {
    init,
    renderThreatsTable,
    inspectThreat
  };
})();
