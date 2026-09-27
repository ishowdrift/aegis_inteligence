/**
 * AEGIS - Platform Settings Module
 * Enterprise SOC configuration, alert thresholds, access control, and appearance preferences
 */

window.AEGIS_SETTINGS = (function () {
  'use strict';

  const defaultSettings = {
    orgName: 'Aegis Global Operations (SOC Prime)',
    timezone: 'UTC',
    telemetryRate: 'realtime',
    archiveDays: '90',
    alertPagerDuty: true,
    alertSlack: true,
    alertSmsP0: true,
    dailyBriefing: true,
    sessionTimeout: '30',
    mfaEnforced: true,
    dualCustody: false,
    customCursor: true,
    soundEnabled: false,
    highContrast: false,
    themeAccent: 'cyan'
  };

  function init() {
    loadSettings();
    setupNavigation();
    setupFormEvents();
  }

  function getStoredSettings() {
    try {
      const stored = localStorage.getItem('aegis_settings');
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      // Fallback
    }
    return { ...defaultSettings };
  }

  function loadSettings() {
    const s = getStoredSettings();

    // General
    const orgInput = document.getElementById('setting-org-name');
    const tzSelect = document.getElementById('setting-timezone');
    const telSelect = document.getElementById('setting-telemetry-rate');
    const archSelect = document.getElementById('setting-archive-days');

    if (orgInput) orgInput.value = s.orgName;
    if (tzSelect) tzSelect.value = s.timezone;
    if (telSelect) telSelect.value = s.telemetryRate;
    if (archSelect) archSelect.value = s.archiveDays;

    // Notifications
    const pdCheck = document.getElementById('setting-pagerduty');
    const slackCheck = document.getElementById('setting-slack');
    const smsCheck = document.getElementById('setting-sms-p0');
    const briefingCheck = document.getElementById('setting-briefing');

    if (pdCheck) pdCheck.checked = s.alertPagerDuty;
    if (slackCheck) slackCheck.checked = s.alertSlack;
    if (smsCheck) smsCheck.checked = s.alertSmsP0;
    if (briefingCheck) briefingCheck.checked = s.dailyBriefing;

    // Security
    const timeoutSelect = document.getElementById('setting-session-timeout');
    const mfaCheck = document.getElementById('setting-mfa');
    const dualCheck = document.getElementById('setting-dual-custody');

    if (timeoutSelect) timeoutSelect.value = s.sessionTimeout;
    if (mfaCheck) mfaCheck.checked = s.mfaEnforced;
    if (dualCheck) dualCheck.checked = s.dualCustody;

    // Appearance & Audio
    const cursorCheck = document.getElementById('setting-custom-cursor');
    const soundCheck = document.getElementById('setting-sound');
    const contrastCheck = document.getElementById('setting-high-contrast');

    if (cursorCheck) cursorCheck.checked = s.customCursor;
    if (soundCheck) soundCheck.checked = s.soundEnabled;
    if (contrastCheck) contrastCheck.checked = s.highContrast;

    // Apply sound state globally
    localStorage.setItem('aegis_sound_enabled', s.soundEnabled ? 'true' : 'false');
  }

  function saveSettings() {
    const current = {
      orgName: document.getElementById('setting-org-name')?.value || defaultSettings.orgName,
      timezone: document.getElementById('setting-timezone')?.value || defaultSettings.timezone,
      telemetryRate: document.getElementById('setting-telemetry-rate')?.value || defaultSettings.telemetryRate,
      archiveDays: document.getElementById('setting-archive-days')?.value || defaultSettings.archiveDays,

      alertPagerDuty: document.getElementById('setting-pagerduty')?.checked ?? true,
      alertSlack: document.getElementById('setting-slack')?.checked ?? true,
      alertSmsP0: document.getElementById('setting-sms-p0')?.checked ?? true,
      dailyBriefing: document.getElementById('setting-briefing')?.checked ?? true,

      sessionTimeout: document.getElementById('setting-session-timeout')?.value || '30',
      mfaEnforced: document.getElementById('setting-mfa')?.checked ?? true,
      dualCustody: document.getElementById('setting-dual-custody')?.checked ?? false,

      customCursor: document.getElementById('setting-custom-cursor')?.checked ?? true,
      soundEnabled: document.getElementById('setting-sound')?.checked ?? false,
      highContrast: document.getElementById('setting-high-contrast')?.checked ?? false,
      themeAccent: defaultSettings.themeAccent
    };

    try {
      localStorage.setItem('aegis_settings', JSON.stringify(current));
      localStorage.setItem('aegis_sound_enabled', current.soundEnabled ? 'true' : 'false');
    } catch (e) {
      // Storage quota or sandboxing
    }

    // Toggle custom cursor if user disabled it
    if (current.customCursor) {
      document.body.classList.add('has-custom-cursor');
    } else {
      document.body.classList.remove('has-custom-cursor');
    }

    window.AEGIS_NAV.showToast('Platform settings saved successfully', 'success');
  }

  function resetSettings() {
    try {
      localStorage.removeItem('aegis_settings');
      localStorage.setItem('aegis_sound_enabled', 'false');
    } catch (e) {}

    loadSettings();
    window.AEGIS_NAV.showToast('Settings restored to factory baseline', 'info');
  }

  function setupNavigation() {
    document.querySelectorAll('.settings-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('is-active'));
        item.classList.add('is-active');

        const sectionId = item.getAttribute('data-section');
        document.querySelectorAll('.settings-section-card').forEach(sec => {
          if (sec.id === `section-${sectionId}`) {
            sec.style.display = 'flex';
          } else {
            sec.style.display = 'none';
          }
        });

        window.AEGIS_NAV.playSocChime('click');
      });
    });
  }

  function setupFormEvents() {
    const saveBtn = document.getElementById('btn-save-settings');
    const resetBtn = document.getElementById('btn-reset-settings');
    const testAudioBtn = document.getElementById('btn-test-chime');
    const rotateKeyBtn = document.getElementById('btn-rotate-api-key');

    if (saveBtn) saveBtn.addEventListener('click', saveSettings);
    if (resetBtn) resetBtn.addEventListener('click', resetSettings);

    if (testAudioBtn) {
      testAudioBtn.addEventListener('click', () => {
        // Temporarily allow chime to verify
        const oldVal = localStorage.getItem('aegis_sound_enabled');
        localStorage.setItem('aegis_sound_enabled', 'true');
        window.AEGIS_NAV.playSocChime('alert');
        window.AEGIS_NAV.showToast('Audio synthesizer verified (880Hz SOC Ping)', 'info');
        localStorage.setItem('aegis_sound_enabled', oldVal);
      });
    }

    if (rotateKeyBtn) {
      rotateKeyBtn.addEventListener('click', () => {
        const keyDisplay = document.getElementById('api-key-display');
        const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const newKey = `aegis_live_sec_${randomHex}`;
        if (keyDisplay) keyDisplay.value = newKey;
        window.AEGIS_NAV.showToast('Ingestion API Key rotated. Previous token revoked.', 'success');
      });
    }
  }

  return {
    init,
    saveSettings,
    resetSettings
  };
})();
