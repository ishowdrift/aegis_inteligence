/**
 * AEGIS - Incident Center Module
 * Incident triage board, lifecycle progression pipeline, SLA trackers, and analyst log
 */

window.AEGIS_INCIDENTS = (function () {
  'use strict';

  let currentTab = 'ALL';

  function init() {
    setupTabs();
    renderIncidents();
  }

  function setupTabs() {
    document.querySelectorAll('#incident-tabs .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#incident-tabs .tab-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentTab = btn.getAttribute('data-tab') || 'ALL';
        renderIncidents();
        window.AEGIS_NAV.playSocChime('click');
      });
    });
  }

  function getFilteredIncidents() {
    const list = window.AEGIS_DATA.incidents;
    if (currentTab === 'ALL') return list;
    return list.filter(inc => inc.status === currentTab);
  }

  function renderIncidents() {
    const container = document.getElementById('incidents-container');
    if (!container) return;

    // Update tab counts
    const countAll = window.AEGIS_DATA.incidents.length;
    const countActive = window.AEGIS_DATA.incidents.filter(i => i.status === 'ACTIVE').length;
    const countInvestigating = window.AEGIS_DATA.incidents.filter(i => i.status === 'INVESTIGATING').length;
    const countResolved = window.AEGIS_DATA.incidents.filter(i => i.status === 'RESOLVED').length;

    const countAllEl = document.getElementById('tab-count-all');
    const countActiveEl = document.getElementById('tab-count-active');
    const countInvEl = document.getElementById('tab-count-investigating');
    const countResEl = document.getElementById('tab-count-resolved');

    if (countAllEl) countAllEl.textContent = countAll;
    if (countActiveEl) countActiveEl.textContent = countActive;
    if (countInvEl) countInvEl.textContent = countInvestigating;
    if (countResEl) countResEl.textContent = countResolved;

    const filtered = getFilteredIncidents();
    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: var(--space-2xl); background: var(--bg-card); border: 1px dashed var(--border-medium); border-radius: var(--radius-lg);">
          <p style="color: var(--text-muted); font-size: var(--text-sm);">No security incidents in '${currentTab}' status.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(inc => {
      const card = document.createElement('div');
      
      let priorityClass = 'priority-p3';
      let sevBadge = 'badge-low';
      if (inc.severity === 'CRITICAL') {
        priorityClass = 'priority-p0';
        sevBadge = 'badge-critical';
      } else if (inc.severity === 'HIGH') {
        priorityClass = 'priority-p1';
        sevBadge = 'badge-high';
      } else if (inc.severity === 'MEDIUM') {
        priorityClass = 'priority-p2';
        sevBadge = 'badge-medium';
      }

      card.className = `incident-card ${priorityClass}`;
      card.innerHTML = `
        <div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-xs);">
            <div style="display:flex; align-items:center; gap:var(--space-xs);">
              <span class="badge ${sevBadge}"><span class="badge-dot"></span>${inc.severity}</span>
              <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted);">${inc.id}</span>
            </div>
            <span class="badge badge-neutral">${inc.status}</span>
          </div>
          
          <h3 style="font-size:var(--text-base); font-weight:600; color:var(--text-primary); margin-bottom:var(--space-xs); line-height:1.35;">
            ${inc.title}
          </h3>

          <p style="font-size:var(--text-xs); color:var(--text-secondary); line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
            ${inc.summary}
          </p>
        </div>

        <div>
          <!-- Affected assets chips -->
          <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:var(--space-sm);">
            ${inc.affectedAssets.map(a => `<code style="font-size:10.5px;">${a}</code>`).join('')}
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--border-subtle); padding-top:var(--space-xs); font-size:var(--text-xs);">
            <div style="display:flex; align-items:center; gap:6px; color:var(--text-muted);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>${inc.assignedTeam.split('(')[0]}</span>
            </div>
            <span style="font-family:var(--font-mono); color:${inc.slaRemaining === 'Met' ? 'var(--color-success)' : 'var(--color-high)'};">
              ${inc.slaRemaining}
            </span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        inspectIncident(inc.id);
      });

      container.appendChild(card);
    });
  }

  function inspectIncident(incidentId) {
    const inc = window.AEGIS_DATA.incidents.find(i => i.id === incidentId);
    if (!inc) return;

    let sevBadge = 'badge-low';
    if (inc.severity === 'CRITICAL') sevBadge = 'badge-critical';
    else if (inc.severity === 'HIGH') sevBadge = 'badge-high';
    else if (inc.severity === 'MEDIUM') sevBadge = 'badge-medium';

    const isResolved = inc.status === 'RESOLVED';
    const isInvestigating = inc.status === 'INVESTIGATING';

    const bodyHtml = `
      <!-- Incident Pipeline Progress -->
      <div class="incident-pipeline-stages">
        <div class="pipeline-stage is-done">
          <div class="stage-num">STAGE 01</div>
          <div class="stage-name">Detected</div>
        </div>
        <div class="pipeline-stage ${isInvestigating || isResolved ? 'is-done' : 'is-current'}">
          <div class="stage-num">STAGE 02</div>
          <div class="stage-name">Triaged</div>
        </div>
        <div class="pipeline-stage ${isResolved ? 'is-done' : (isInvestigating ? 'is-current' : '')}">
          <div class="stage-num">STAGE 03</div>
          <div class="stage-name">Contained</div>
        </div>
        <div class="pipeline-stage ${isResolved ? 'is-done' : ''}">
          <div class="stage-num">STAGE 04</div>
          <div class="stage-name">Remediated</div>
        </div>
      </div>

      <!-- Overview Header Meta -->
      <div class="card" style="background:var(--bg-surface); padding:var(--space-md); margin-bottom:var(--space-md);">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-sm); font-size:var(--text-xs);">
          <div>
            <span style="color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">Priority & Category</span>
            <p style="color:var(--text-primary); font-weight:600; margin-top:2px;">${inc.priority}</p>
          </div>
          <div>
            <span style="color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">Response SLA Status</span>
            <p style="color:${inc.slaRemaining === 'Met' ? 'var(--color-success)' : 'var(--color-high)'}; font-family:var(--font-mono); font-weight:600; margin-top:2px;">${inc.slaRemaining}</p>
          </div>
          <div>
            <span style="color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">Assigned Unit</span>
            <p style="color:var(--text-primary); margin-top:2px;">${inc.assignedTeam}</p>
          </div>
          <div>
            <span style="color:var(--text-muted); font-family:var(--font-mono); text-transform:uppercase;">Impact Assessment</span>
            <p style="color:var(--accent-cyan); font-family:var(--font-mono); font-weight:600; margin-top:2px;">${inc.impactScore}</p>
          </div>
        </div>
      </div>

      <!-- Incident Executive Narrative -->
      <div style="margin-bottom:var(--space-md);">
        <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase;">Executive Summary</span>
        <p style="font-size:var(--text-sm); color:var(--text-primary); line-height:1.6; margin-top:4px;">${inc.summary}</p>
      </div>

      <!-- Affected Assets -->
      <div style="margin-bottom:var(--space-md);">
        <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase;">Targeted Fleet Assets</span>
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
          ${inc.affectedAssets.map(a => `<code style="font-size:var(--text-xs);">${a}</code>`).join('')}
        </div>
      </div>

      <!-- Indicators -->
      <div style="margin-bottom:var(--space-md);">
        <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase;">Confirmed Threat Indicators</span>
        <div class="ioc-pill-list">
          ${inc.indicators.map(ind => `<span class="ioc-pill">${ind}</span>`).join('')}
        </div>
      </div>

      <!-- Timeline -->
      <div style="margin-bottom:var(--space-md);">
        <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase;">Investigation Sequence</span>
        <div class="investigation-timeline" style="margin-top:var(--space-sm);">
          ${inc.timeline.map(t => `
            <div class="timeline-step">
              <span class="timeline-dot"></span>
              <span class="timeline-time">${t.time}</span>
              <p style="font-size:var(--text-xs); font-weight:600; color:var(--text-primary); margin-top:2px;">${t.title}</p>
              <p class="timeline-text" style="font-size:var(--text-xs); color:var(--text-secondary);">${t.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Containment Actions Checklist -->
      <div style="margin-bottom:var(--space-md);">
        <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase;">Active Containment Measures</span>
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
          ${inc.containmentActions.map((act, i) => `
            <label style="display:flex; align-items:center; gap:8px; font-size:var(--text-xs); color:var(--text-secondary); cursor:pointer;">
              <input type="checkbox" ${act.done ? 'checked' : ''} data-action-idx="${i}" class="action-check-input" style="accent-color:var(--accent-cyan);">
              <span style="${act.done ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${act.name}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Analyst Activity Log & Add Note -->
      <div>
        <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--text-muted); text-transform:uppercase;">Analyst Notes & Activity</span>
        <div id="analyst-notes-list" style="display:flex; flex-direction:column; gap:8px; margin:8px 0;">
          ${inc.notes.map(n => `
            <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:3px; font-size:var(--text-xs);">
                <strong style="color:var(--accent-cyan); font-family:var(--font-mono);">${n.author}</strong>
                <span style="color:var(--text-muted); font-family:var(--font-mono);">${n.time}</span>
              </div>
              <p style="font-size:var(--text-xs); color:var(--text-primary); line-height:1.4;">${n.text}</p>
            </div>
          `).join('')}
        </div>

        <!-- Add note input -->
        <div style="display:flex; gap:6px; margin-top:8px;">
          <input type="text" id="new-note-input" placeholder="Append forensic note or triage comment..." style="flex:1; background:var(--bg-input); border:1px solid var(--border-medium); border-radius:var(--radius-sm); padding:6px 10px; color:var(--text-primary); font-size:var(--text-xs);">
          <button class="btn btn-secondary btn-sm" id="btn-add-note">Post</button>
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary btn-sm" id="btn-reassign-team">
        Escalate to Tier 3
      </button>
      <button class="btn ${isResolved ? 'btn-secondary' : 'btn-primary'} btn-sm" id="btn-resolve-incident">
        ${isResolved ? 'Re-open Investigation' : 'Mark Incident Resolved'}
      </button>
    `;

    window.AEGIS_NAV.openSlideover(
      inc.title,
      `${inc.id} — Opened ${inc.opened}`,
      bodyHtml,
      footerHtml
    );

    // Bind Note Posting
    const noteInput = document.getElementById('new-note-input');
    const noteBtn = document.getElementById('btn-add-note');
    const notesContainer = document.getElementById('analyst-notes-list');

    if (noteBtn && noteInput) {
      noteBtn.addEventListener('click', () => {
        const text = noteInput.value.trim();
        if (!text) return;

        const newNote = {
          author: 'Alex Vance (You)',
          time: 'Just now',
          text: text
        };
        inc.notes.push(newNote);

        const noteDiv = document.createElement('div');
        noteDiv.style.cssText = 'background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:8px 10px;';
        noteDiv.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:3px; font-size:var(--text-xs);">
            <strong style="color:var(--accent-cyan); font-family:var(--font-mono);">${newNote.author}</strong>
            <span style="color:var(--text-muted); font-family:var(--font-mono);">${newNote.time}</span>
          </div>
          <p style="font-size:var(--text-xs); color:var(--text-primary); line-height:1.4;">${newNote.text}</p>
        `;
        notesContainer.appendChild(noteDiv);
        noteInput.value = '';
        window.AEGIS_NAV.showToast('Analyst note appended to case file', 'info');
      });
    }

    // Bind Checklist Checkbox Toggles
    document.querySelectorAll('.action-check-input').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-action-idx'), 10);
        inc.containmentActions[idx].done = e.target.checked;
        const span = e.target.nextElementSibling;
        if (span) {
          span.style.textDecoration = e.target.checked ? 'line-through' : 'none';
          span.style.color = e.target.checked ? 'var(--text-muted)' : 'var(--text-secondary)';
        }
      });
    });

    // Bind Resolution Toggle
    const resolveBtn = document.getElementById('btn-resolve-incident');
    if (resolveBtn) {
      resolveBtn.addEventListener('click', () => {
        if (inc.status === 'RESOLVED') {
          inc.status = 'INVESTIGATING';
          window.AEGIS_NAV.showToast(`Incident ${inc.id} re-opened for further forensics.`, 'info');
        } else {
          inc.status = 'RESOLVED';
          inc.slaRemaining = 'Met';
          window.AEGIS_NAV.showToast(`Incident ${inc.id} marked as RESOLVED. Post-incident report logged.`, 'success');
        }
        renderIncidents();
        window.AEGIS_NAV.closeSlideover();
      });
    }

    const reassignBtn = document.getElementById('btn-reassign-team');
    if (reassignBtn) {
      reassignBtn.addEventListener('click', () => {
        inc.assignedTeam = 'CIRT Escalation Cell (Tier 3 Lead)';
        window.AEGIS_NAV.showToast(`Incident ${inc.id} escalated to CIRT Tier 3`, 'info');
        window.AEGIS_NAV.closeSlideover();
        renderIncidents();
      });
    }
  }

  return {
    init,
    renderIncidents,
    inspectIncident
  };
})();
