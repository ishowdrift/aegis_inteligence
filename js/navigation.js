/**
 * AEGIS - Navigation, Router, Custom Cursor, Command Palette & Global Controls
 */

window.AEGIS_NAV = (function () {
  'use strict';

  let currentRoute = 'overview';
  const routes = ['overview', 'network', 'threats', 'incidents', 'analytics', 'endpoints', 'settings'];

  // Route Titles & Breadcrumbs
  const routeMeta = {
    overview: { title: 'Security Overview', breadcrumb: 'OVERVIEW' },
    network: { title: 'Network Intelligence', breadcrumb: 'NETWORK INTELLIGENCE' },
    threats: { title: 'Threat Intelligence', breadcrumb: 'THREAT INTELLIGENCE' },
    incidents: { title: 'Incident Center', breadcrumb: 'INCIDENT CENTER' },
    analytics: { title: 'Security Analytics', breadcrumb: 'ANALYTICS & METRICS' },
    endpoints: { title: 'Endpoint Security', breadcrumb: 'FLEET INVENTORY' },
    settings: { title: 'Platform Settings', breadcrumb: 'SYSTEM SETTINGS' }
  };

  /* ==========================================================================
     Audio Synthesis (Subtle Technical SOC Chimes using Web Audio API)
     ========================================================================== */
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playSocChime(type) {
    const soundEnabled = localStorage.getItem('aegis_sound_enabled') === 'true';
    if (!soundEnabled) return;

    try {
      const ctx = getAudioContext();
      if (!ctx || ctx.state === 'suspended') {
        ctx && ctx.resume();
      }
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'alert') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(780, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch (e) {
      // Audio playback failed silently
    }
  }

  /* ==========================================================================
     Custom Cursor (Desktop Only)
     ========================================================================== */
  function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.body.classList.add('has-custom-cursor');

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    // Smooth trailing ring
    function renderRing() {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

    // Hover expanders
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('a, button, input, select, textarea, .data-table tr, .incident-stream-item, .filter-pill-btn, .tab-btn, .command-result-item');
      if (target) {
        ring.classList.add('is-hovered');
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('a, button, input, select, textarea, .data-table tr, .incident-stream-item, .filter-pill-btn, .tab-btn, .command-result-item');
      if (target) {
        ring.classList.remove('is-hovered');
      }
    }, { passive: true });

    window.addEventListener('mousedown', () => ring.classList.add('is-clicking'), { passive: true });
    window.addEventListener('mouseup', () => ring.classList.remove('is-clicking'), { passive: true });
  }

  /* ==========================================================================
     Toast Notifications System
     ========================================================================== */
  function showToast(message, type = 'info', duration = 3400) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
      playSocChime('success');
    } else if (type === 'critical') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-critical)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
      playSocChime('alert');
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
      playSocChime('click');
    }

    toast.innerHTML = `
      <div style="flex-shrink:0;">${iconSvg}</div>
      <div style="flex:1; color: var(--text-primary); font-size: var(--text-sm);">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  /* ==========================================================================
     Slideover Drawer Controller (for Threats, Incidents, Endpoints, Network)
     ========================================================================== */
  function openSlideover(title, subtitle, bodyHtml, footerHtml = '') {
    const backdrop = document.getElementById('slideover-backdrop');
    const panel = document.getElementById('slideover-panel');
    const titleEl = document.getElementById('slideover-title');
    const subtitleEl = document.getElementById('slideover-subtitle');
    const bodyEl = document.getElementById('slideover-body');
    const footerEl = document.getElementById('slideover-footer');

    if (!panel || !backdrop) return;

    titleEl.textContent = title;
    subtitleEl.textContent = subtitle;
    bodyEl.innerHTML = bodyHtml;
    
    if (footerHtml) {
      footerEl.innerHTML = footerHtml;
      footerEl.style.display = 'flex';
    } else {
      footerEl.innerHTML = '';
      footerEl.style.display = 'none';
    }

    backdrop.classList.add('is-open');
    panel.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    playSocChime('click');
  }

  function closeSlideover() {
    const backdrop = document.getElementById('slideover-backdrop');
    const panel = document.getElementById('slideover-panel');
    if (!panel || !backdrop) return;

    backdrop.classList.remove('is-open');
    panel.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     Command Palette (Ctrl+K Global Search)
     ========================================================================== */
  function initCommandPalette() {
    const backdrop = document.getElementById('command-modal-backdrop');
    const input = document.getElementById('command-search-input');
    const resultsContainer = document.getElementById('command-results');
    const openBtns = document.querySelectorAll('.search-command-btn');

    if (!backdrop || !input || !resultsContainer) return;

    function openPalette() {
      backdrop.classList.add('is-open');
      input.value = '';
      input.focus();
      renderResults('');
      document.body.style.overflow = 'hidden';
      playSocChime('click');
    }

    function closePalette() {
      backdrop.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    openBtns.forEach(btn => btn.addEventListener('click', openPalette));

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closePalette();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        backdrop.classList.contains('is-open') ? closePalette() : openPalette();
      }
      if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
        closePalette();
      }
    });

    input.addEventListener('input', (e) => {
      renderResults(e.target.value.trim().toLowerCase());
    });

    // Expose openPalette
    window.AEGIS_NAV.openCommandPalette = openPalette;
    window.AEGIS_NAV.closeCommandPalette = closePalette;

    function renderResults(query) {
      const results = [];

      // 1. Pages
      routes.forEach(r => {
        const meta = routeMeta[r];
        if (!query || meta.title.toLowerCase().includes(query) || r.includes(query)) {
          results.push({
            title: `Navigate to ${meta.title}`,
            category: 'Page Route',
            action: () => { navigateTo(r); closePalette(); }
          });
        }
      });

      // 2. Threats
      window.AEGIS_DATA.threats.forEach(t => {
        if (!query || t.title.toLowerCase().includes(query) || t.id.toLowerCase().includes(query) || t.target.toLowerCase().includes(query)) {
          results.push({
            title: `${t.id}: ${t.title} [${t.severity}]`,
            category: 'Threat Intelligence',
            action: () => {
              navigateTo('threats');
              closePalette();
              setTimeout(() => {
                if (window.AEGIS_THREATS && window.AEGIS_THREATS.inspectThreat) {
                  window.AEGIS_THREATS.inspectThreat(t.id);
                }
              }, 150);
            }
          });
        }
      });

      // 3. Incidents
      window.AEGIS_DATA.incidents.forEach(inc => {
        if (!query || inc.title.toLowerCase().includes(query) || inc.id.toLowerCase().includes(query)) {
          results.push({
            title: `${inc.id}: ${inc.title} [${inc.status}]`,
            category: 'Incident Center',
            action: () => {
              navigateTo('incidents');
              closePalette();
              setTimeout(() => {
                if (window.AEGIS_INCIDENTS && window.AEGIS_INCIDENTS.inspectIncident) {
                  window.AEGIS_INCIDENTS.inspectIncident(inc.id);
                }
              }, 150);
            }
          });
        }
      });

      // 4. Endpoints
      window.AEGIS_DATA.endpoints.forEach(ep => {
        if (!query || ep.device.toLowerCase().includes(query) || ep.ip.toLowerCase().includes(query)) {
          results.push({
            title: `${ep.device} (${ep.ip}) - ${ep.os}`,
            category: 'Fleet Endpoint',
            action: () => {
              navigateTo('endpoints');
              closePalette();
              setTimeout(() => {
                if (window.AEGIS_ENDPOINTS && window.AEGIS_ENDPOINTS.inspectEndpoint) {
                  window.AEGIS_ENDPOINTS.inspectEndpoint(ep.device);
                }
              }, 150);
            }
          });
        }
      });

      resultsContainer.innerHTML = '';
      if (results.length === 0) {
        resultsContainer.innerHTML = `<li style="padding: var(--space-md); text-align: center; color: var(--text-muted); font-size: var(--text-sm);">No security records match "${query}"</li>`;
        return;
      }

      results.slice(0, 10).forEach((res, idx) => {
        const li = document.createElement('li');
        li.className = `command-result-item ${idx === 0 ? 'is-selected' : ''}`;
        li.innerHTML = `
          <div class="command-result-main">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span class="command-result-title">${res.title}</span>
          </div>
          <span class="command-result-category">${res.category}</span>
        `;
        li.addEventListener('click', () => {
          res.action();
        });
        resultsContainer.appendChild(li);
      });
    }
  }

  /* ==========================================================================
     Notifications Dropdown Handler
     ========================================================================== */
  function initNotifications() {
    const trigger = document.getElementById('notif-btn');
    const panel = document.getElementById('notif-panel');
    const list = document.getElementById('notif-list');
    const clearBtn = document.getElementById('notif-clear-btn');
    const badge = document.getElementById('notif-badge');

    if (!trigger || !panel || !list) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('is-open');
      playSocChime('click');
    });

    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== trigger) {
        panel.classList.remove('is-open');
      }
    });

    function renderNotifications() {
      list.innerHTML = '';
      const unreadCount = window.AEGIS_DATA.notifications.filter(n => !n.read).length;
      if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
      }

      window.AEGIS_DATA.notifications.forEach(n => {
        const li = document.createElement('li');
        li.className = `notif-item ${n.read ? '' : 'is-unread'}`;
        li.innerHTML = `
          <div class="notif-item-top">
            <span class="notif-item-title">${n.title}</span>
            <span class="notif-item-time">${n.time}</span>
          </div>
          <p class="notif-item-desc">${n.message}</p>
        `;
        li.addEventListener('click', () => {
          n.read = true;
          panel.classList.remove('is-open');
          renderNotifications();
          navigateTo(n.route);
          if (n.route === 'threats' && window.AEGIS_THREATS) {
            window.AEGIS_THREATS.inspectThreat(n.targetId);
          } else if (n.route === 'incidents' && window.AEGIS_INCIDENTS) {
            window.AEGIS_INCIDENTS.inspectIncident(n.targetId);
          } else if (n.route === 'endpoints' && window.AEGIS_ENDPOINTS) {
            window.AEGIS_ENDPOINTS.inspectEndpoint(n.targetId);
          }
        });
        list.appendChild(li);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.AEGIS_DATA.notifications.forEach(n => n.read = true);
        renderNotifications();
        showToast('All notifications marked as read', 'info');
      });
    }

    renderNotifications();
  }

  /* ==========================================================================
     Core Router & View Switcher
     ========================================================================== */
  function navigateTo(route, updateHistory = true) {
    if (!routes.includes(route)) {
      route = 'overview';
    }

    currentRoute = route;

    // Update Browser Hash/History
    if (updateHistory) {
      window.location.hash = `#/${route}`;
    }

    // Update Nav Active State in Sidebar
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
      const linkRoute = link.getAttribute('data-route');
      if (linkRoute === route) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('is-active');
        link.removeAttribute('aria-current');
      }
    });

    // Update Breadcrumbs & Document Title
    const meta = routeMeta[route] || { title: 'Security Intelligence', breadcrumb: route.toUpperCase() };
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = meta.breadcrumb;
    }
    document.title = `AEGIS — ${meta.title}`;

    // Switch Page Views
    document.querySelectorAll('.page-view').forEach(view => {
      if (view.id === `view-${route}`) {
        view.classList.add('is-active');
      } else {
        view.classList.remove('is-active');
      }
    });

    // Trigger page-specific initializations or renders
    if (route === 'network' && window.AEGIS_NETWORK) {
      window.AEGIS_NETWORK.onEnter();
    } else if (route === 'analytics' && window.AEGIS_ANALYTICS) {
      window.AEGIS_ANALYTICS.renderAllCharts();
    } else if (route === 'threats' && window.AEGIS_THREATS) {
      window.AEGIS_THREATS.renderThreatsTable();
    } else if (route === 'incidents' && window.AEGIS_INCIDENTS) {
      window.AEGIS_INCIDENTS.renderIncidents();
    } else if (route === 'endpoints' && window.AEGIS_ENDPOINTS) {
      window.AEGIS_ENDPOINTS.renderEndpointsTable();
    }

    // Close mobile drawer if open
    closeMobileSidebar();
    closeSlideover();
    window.scrollTo({ top: 0, behavior: 'instant' });
    playSocChime('click');
  }

  /* ==========================================================================
     Mobile Sidebar Drawer Controller
     ========================================================================== */
  function initMobileSidebar() {
    const trigger = document.getElementById('mobile-menu-trigger');
    const sidebar = document.getElementById('app-sidebar');
    const closeBtn = document.getElementById('sidebar-close-btn');

    if (!trigger || !sidebar) return;

    let backdrop = document.getElementById('sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebar-backdrop';
      backdrop.className = 'slideover-backdrop';
      document.body.appendChild(backdrop);
    }

    trigger.addEventListener('click', () => {
      sidebar.classList.add('is-mobile-open');
      backdrop.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      playSocChime('click');
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeMobileSidebar);
    }

    backdrop.addEventListener('click', closeMobileSidebar);
  }

  function closeMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('is-mobile-open');
    if (backdrop) backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     Initialize Global Navigation
     ========================================================================== */
  function init() {
    initCustomCursor();
    initCommandPalette();
    initNotifications();
    initMobileSidebar();

    // Slideover close button & backdrop
    const closeBtn = document.getElementById('slideover-close-btn');
    const backdrop = document.getElementById('slideover-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', closeSlideover);
    if (backdrop) backdrop.addEventListener('click', closeSlideover);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSlideover();
    });

    // Sidebar navigation clicks
    document.querySelectorAll('.sidebar-nav .nav-item, .settings-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        if (route) navigateTo(route);
      });
    });

    // Hash change handler for direct links and browser back/forward
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash && routes.includes(hash)) {
        navigateTo(hash, false);
      }
    });

    // Initial Route Detection
    const initialHash = window.location.hash.replace('#/', '').replace('#', '');
    if (initialHash && routes.includes(initialHash)) {
      navigateTo(initialHash, false);
    } else {
      navigateTo('overview', false);
    }
  }

  return {
    init,
    navigateTo,
    getCurrentRoute: () => currentRoute,
    showToast,
    openSlideover,
    closeSlideover,
    playSocChime
  };
})();
