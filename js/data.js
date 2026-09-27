/**
 * AEGIS - Security Intelligence Platform
 * Simulated Enterprise Security Data Layer
 * Fictional datasets for SOC monitoring, threat hunting, and incident analysis.
 */

window.AEGIS_DATA = (function () {
  'use strict';

  const systemHealth = {
    overallStatus: 'PROTECTED',
    uptimePercentage: '99.98%',
    activeThreatsCount: 7,
    protectedAssetsCount: 1284,
    securityEventsCount: '24.8K',
    detectionRate: '99.4%',
    meanTimeToDetect: '1.8m',
    meanTimeToRespond: '4.2m',
    telemetryIngestRate: '14,280 eps',
    engines: [
      { name: 'Zero-Trust Gatekeeper', status: 'ONLINE', latency: '4ms', load: '34%' },
      { name: 'Neural Anomaly Engine', status: 'ONLINE', latency: '12ms', load: '58%' },
      { name: 'EDR Pulse Telemetry', status: 'ONLINE', latency: '2ms', load: '41%' },
      { name: 'Sigma Rule Pipeline', status: 'ONLINE', latency: '8ms', load: '62%' },
      { name: 'Automated Quarantine Daemon', status: 'ONLINE', latency: '1ms', load: '19%' }
    ]
  };

  const threats = [
    {
      id: 'THR-8092',
      title: 'Credential Stuffing Anomaly',
      severity: 'HIGH',
      source: '198.51.100.42 (RU / AS48212)',
      target: 'AUTH-GW-01',
      targetIp: '10.240.0.12',
      detected: '08:42:15 UTC',
      relativeTime: '12 min ago',
      status: 'INVESTIGATING',
      mitre: {
        tactic: 'Initial Access (TA0001)',
        technique: 'T1078 - Valid Accounts'
      },
      riskScore: 84,
      iocs: [
        { type: 'IP', value: '198.51.100.42' },
        { type: 'CIDR', value: '198.51.100.0/24' },
        { type: 'User-Agent', value: 'Mozilla/5.0 (Windows NT 10.0; Go-http-client/1.1)' }
      ],
      description: 'Distributed credential stuffing spike originating from a known proxy pool targeting SSO endpoint /api/v2/auth/oauth2. 1,420 failed authentication attempts recorded in 90 seconds from 34 rotating IP subnets.',
      timeline: [
        { time: '08:40:02 UTC', event: 'First anomalous volume spike flagged by Rate-Limiter Daemon' },
        { time: '08:41:19 UTC', event: 'Heuristic engine correlates distributed IPs sharing common TLS fingerprint' },
        { time: '08:42:15 UTC', event: 'Threat generated with HIGH severity; automated CAPTCHA challenge initiated' },
        { time: '08:46:00 UTC', event: 'SOC Tier-2 analyst assigned; source CIDR placed in shadow quarantine' }
      ],
      remediationSteps: [
        'Enforce adaptive multi-factor authentication across all regional gateways',
        'Deploy temporary perimeter geo-filtering on AS48212 subnet ranges',
        'Invalidate active sessions for targeted administrator accounts',
        'Export telemetry slice to Threat Hunting repository'
      ]
    },
    {
      id: 'THR-8089',
      title: 'Suspicious In-Memory PowerShell Injection',
      severity: 'CRITICAL',
      source: 'Internal 10.240.14.88',
      target: 'ENG-LT-042',
      targetIp: '10.240.14.88',
      detected: '08:12:30 UTC',
      relativeTime: '42 min ago',
      status: 'CONTAINED',
      mitre: {
        tactic: 'Execution (TA0002) / Defense Evasion (TA0005)',
        technique: 'T1059.001 - PowerShell In-Memory'
      },
      riskScore: 96,
      iocs: [
        { type: 'SHA-256', value: '7b9c6f24a1b8d34e9e115024d4567ac89ef32194c7b6540321aef789456123cd' },
        { type: 'Process', value: 'powershell.exe -ExecutionPolicy Bypass -NoP -EncodedCommand' },
        { type: 'Memory Region', value: '0x00007FF6B4120000 (RWX Segment)' }
      ],
      description: 'Reflective DLL injection detected within an unsigned PowerShell child process spawned from Slack desktop sandbox. EDR memory scanner identified Cobalt Strike beacon shellcode signature attempting Named Pipe injection.',
      timeline: [
        { time: '08:11:45 UTC', event: 'Slack spawned unauthorized subshell cmd.exe invoking powershell.exe' },
        { time: '08:12:30 UTC', event: 'AMSIScanBuffer bypass technique intercepted in memory segment' },
        { time: '08:13:02 UTC', event: 'EDR Agent severed host network interface and suspended parent PID 8912' },
        { time: '08:20:15 UTC', event: 'Host containment verified; forensic memory dump uploaded to sandbox' }
      ],
      remediationSteps: [
        'Keep host isolated until full forensic disk image acquisition is completed',
        'Revoke Kerberos TGT and rotate credentials for user account m.harrison',
        'Verify integrity of Slack client extension binaries',
        'Push endpoint IOC rule blocking hash across enterprise fleet'
      ]
    },
    {
      id: 'THR-8085',
      title: 'Unusual Outbound C2 Beaconing',
      severity: 'HIGH',
      source: 'DEV-WS-019 (10.100.4.15)',
      target: '203.0.113.88 (NL / AS16276)',
      targetIp: '203.0.113.88',
      detected: '07:55:04 UTC',
      relativeTime: '59 min ago',
      status: 'INVESTIGATING',
      mitre: {
        tactic: 'Command and Control (TA0011)',
        technique: 'T1071.004 - DNS / TLS C2 Beaconing'
      },
      riskScore: 88,
      iocs: [
        { type: 'Domain', value: 'telemetry-cdn-sync.cloud-edge.live' },
        { type: 'IP', value: '203.0.113.88' },
        { type: 'Interval', value: '60s jittered (3.2%)' }
      ],
      description: 'Periodic HTTPS requests on outbound port 8443 with consistent payload length (512 bytes) and slight jitter. Destination domain was registered 3 days ago with privacy-shielded WHOIS and dynamic DNS mapping.',
      timeline: [
        { time: '06:30:00 UTC', event: 'First connection established to unclassified exterior IP' },
        { time: '07:45:10 UTC', event: 'Statistical jitter detector surpassed beaconing confidence threshold (92%)' },
        { time: '07:55:04 UTC', event: 'Alert raised; border firewall configured to intercept and inspect TLS traffic' }
      ],
      remediationSteps: [
        'Apply DNS sinkhole for telemetry-cdn-sync.cloud-edge.live enterprise-wide',
        'Inspect outbound TLS payload metadata for steganographic payloads',
        'Perform live process review on workstation DEV-WS-019'
      ]
    },
    {
      id: 'THR-8081',
      title: 'Kerberoasting Ticket Request Flood',
      severity: 'HIGH',
      source: 'OPS-SRV-08 (172.16.8.22)',
      target: 'DC-PRIMARY-01',
      targetIp: '10.240.1.5',
      detected: '07:31:18 UTC',
      relativeTime: '1h 23m ago',
      status: 'CONTAINED',
      mitre: {
        tactic: 'Credential Access (TA0006)',
        technique: 'T1558.003 - Kerberoasting'
      },
      riskScore: 82,
      iocs: [
        { type: 'Service Ticket', value: 'MSSQLSvc/db-cluster.aegis.internal:1433' },
        { type: 'Encryption Type', value: 'RC4-HMAC (Downgraded)' },
        { type: 'Request Count', value: '47 SPN requests in 4.5 seconds' }
      ],
      description: 'Anomalous volume of TGS ticket requests with RC4-HMAC encryption requested from low-privilege service account. Pattern indicates automated SPN harvesting for offline cracking.',
      timeline: [
        { time: '07:30:55 UTC', event: 'Multiple Kerberos TGS-REQ packets generated for legacy SPNs' },
        { time: '07:31:18 UTC', event: 'Domain Controller policy alerted on RC4 ticket encryption downgrade' },
        { time: '07:35:00 UTC', event: 'Service account svc_backup temporarily locked by security policy' }
      ],
      remediationSteps: [
        'Force AES256 encryption on all Active Directory Service Principal Names',
        'Reset credentials for compromised service account svc_backup with 32-char entropy',
        'Audit domain permissions for remaining service identities'
      ]
    },
    {
      id: 'THR-8077',
      title: 'DNS Tunneling Exfiltration Pattern',
      severity: 'MEDIUM',
      source: 'KUBE-WORKER-09 (10.240.32.19)',
      target: '198.51.100.170 (UA)',
      targetIp: '198.51.100.170',
      detected: '06:58:22 UTC',
      relativeTime: '1h 56m ago',
      status: 'MONITORING',
      mitre: {
        tactic: 'Exfiltration (TA0010)',
        technique: 'T1048.003 - Exfiltration Over Alternative Protocol'
      },
      riskScore: 68,
      iocs: [
        { type: 'Domain Regex', value: '*.[a-f0-9]{32}.ns2.analytics-resolver.net' },
        { type: 'Query Type', value: 'TXT / NULL record requests' }
      ],
      description: 'High entropy subdomains queried at 28 requests/sec with base64 encoded chunks in TXT queries. Total simulated exfiltration volume estimated at 3.8 MB.',
      timeline: [
        { time: '06:50:00 UTC', event: 'DNS resolver logged abnormal lookup frequency' },
        { time: '06:58:22 UTC', event: 'Entropy scoring flagged possible tunnel; rate-limiting applied' }
      ],
      remediationSteps: [
        'Quarantine pod cluster namespace kube-system/telemetry-exporter',
        'Redirect rogue DNS resolver requests to internal blackhole sinkhole',
        'Inspect container image signature against golden registry build'
      ]
    },
    {
      id: 'THR-8073',
      title: 'Zero-Day Exploit Probe (CVE-2026-3190 Candidate)',
      severity: 'CRITICAL',
      source: '185.220.101.5 (DE / Tor Exit)',
      target: 'CORE-API-GW-01',
      targetIp: '10.240.0.18',
      detected: '06:14:09 UTC',
      relativeTime: '2h 40m ago',
      status: 'MITIGATED',
      mitre: {
        tactic: 'Initial Access (TA0001)',
        technique: 'T1190 - Exploit Public-Facing Application'
      },
      riskScore: 98,
      iocs: [
        { type: 'URI Pattern', value: '/api/v1/debug/pprof/heap?dump=..%2F..%2Fsys' },
        { type: 'IP', value: '185.220.101.5' }
      ],
      description: 'Crafted HTTP/2 multiplexed probe targeting unauthenticated telemetry endpoint with memory dump traversal arguments. Request dropped and blocked at WAF layer.',
      timeline: [
        { time: '06:14:09 UTC', event: 'WAF Rule #81992 triggered; HTTP 403 returned' },
        { time: '06:14:15 UTC', event: 'Origin IP automatically added to global IP reputation drop list' }
      ],
      remediationSteps: [
        'Verify debug endpoints disabled on all production ingress clusters',
        'Patch ingress controller firmware to v2.4.1',
        'Submit payload signature to national vulnerability database'
      ]
    },
    {
      id: 'THR-8069',
      title: 'Unauthorized S3 Bucket ACL Enumeration',
      severity: 'MEDIUM',
      source: 'Cloud Role: dev-deployer-svc',
      target: 's3://aegis-customer-vault-prod',
      targetIp: 'AWS Cloud API',
      detected: '05:40:11 UTC',
      relativeTime: '3h 14m ago',
      status: 'MITIGATED',
      mitre: {
        tactic: 'Discovery (TA0007)',
        technique: 'T1526 - Cloud Service Discovery'
      },
      riskScore: 62,
      iocs: [
        { type: 'API Call', value: 's3:GetBucketAcl / s3:ListBucket' },
        { type: 'ARN', value: 'arn:aws:iam::492019482104:role/dev-deployer-svc' }
      ],
      description: 'Automated script under developer CI/CD identity attempted to query access control lists for production storage vaults. Permissions were denied by IAM Service Control Policy.',
      timeline: [
        { time: '05:40:11 UTC', event: 'CloudTrail logged repeated AccessDenied events' },
        { time: '05:41:00 UTC', event: 'DevOps team notified; CI token rotated' }
      ],
      remediationSteps: [
        'Scope CI/CD role permissions to staging environments only',
        'Implement tighter IAM boundaries around customer vault buckets'
      ]
    },
    {
      id: 'THR-8062',
      title: 'Endpoint Tamper Protection Alert',
      severity: 'LOW',
      source: 'FIN-LT-109 (10.240.18.55)',
      target: 'EDR-SERVICE-AGENT',
      targetIp: '10.240.18.55',
      detected: '04:15:33 UTC',
      relativeTime: '4h 39m ago',
      status: 'RESOLVED',
      mitre: {
        tactic: 'Defense Evasion (TA0005)',
        technique: 'T1562.001 - Disable or Modify Tools'
      },
      riskScore: 45,
      iocs: [
        { type: 'Service', value: 'AegisEndpointSvc' },
        { type: 'Action', value: 'StopService attempt via reg.exe' }
      ],
      description: 'User initiated an unauthorized registry key modification to test software compatibility. Aegis tamper protection kernel driver rejected the change and restored integrity.',
      timeline: [
        { time: '04:15:33 UTC', event: 'Tamper protection blocked driver unhook' },
        { time: '04:20:00 UTC', event: 'User contacted SOC to explain software test requirement' }
      ],
      remediationSteps: [
        'No further containment required; policy documented for user'
      ]
    }
  ];

  const incidents = [
    {
      id: 'INC-4029',
      title: 'Unusual Authentication Pattern Across Multi-Region SSO',
      severity: 'HIGH',
      affectedAssets: ['AUTH-GW-01', 'PROD-IDP-02', 'OKTA-CONNECTOR'],
      assignedTeam: 'SecOps Alpha (Lead: Alex Vance)',
      opened: '12 min ago',
      status: 'INVESTIGATING',
      slaRemaining: '48m remaining',
      priority: 'P1 - High Priority',
      category: 'Identity & Access',
      impactScore: '74 / 100',
      summary: 'Spike in failed authentication requests from rotating Russian and European residential proxy ranges targeting senior engineer identities. Two anomalous successful logins detected from Prague within 4 minutes of a Dallas login (impossible travel).',
      timeline: [
        { time: '08:38 UTC', title: 'Telemetry Ingestion', desc: 'Auth telemetry ingest rate surged to 320 logins/sec on AUTH-GW-01.' },
        { time: '08:41 UTC', title: 'Impossible Travel Flagged', desc: 'User m.harrison authenticated from Dallas (US) and Prague (CZ) within 4 minutes.' },
        { time: '08:42 UTC', title: 'Automated Step-Up Challenge', desc: 'FIDO2 hardware challenge triggered; Prague login session failed challenge.' },
        { time: '08:46 UTC', title: 'SOC Investigation Launched', desc: 'Analyst Vance assigned; temporary token revocation initiated.' }
      ],
      indicators: [
        '198.51.100.42 (RU / AS48212)',
        '91.240.118.12 (CZ / AS1976)',
        'User: m.harrison@aegis-corp.internal'
      ],
      notes: [
        { author: 'Alex Vance', time: '08:50 UTC', text: 'Checked user travel calendar. Confirmed user is in Dallas office today. Prague IP flagged as compromised residential VPN exit node.' },
        { author: 'Elena Rostova (SecOps)', time: '08:53 UTC', text: 'Issued session revocation across Google Workspace and AWS IAM Identity Center.' }
      ],
      containmentActions: [
        { name: 'Revoke active OAuth refresh tokens', done: true },
        { name: 'Enforce FIDO2-only authentication policy', done: true },
        { name: 'Quarantine user laptop for forensic sweep', done: false },
        { name: 'Notify Legal & Compliance of impossible travel trigger', done: false }
      ]
    },
    {
      id: 'INC-4028',
      title: 'Suspicious Outbound C2 Connection via Port 8443',
      severity: 'CRITICAL',
      affectedAssets: ['DEV-WS-019', 'EDGE-FW-01', 'DNS-RESOLVER-INTERNAL'],
      assignedTeam: 'Threat Hunting Squad (Lead: Marcus Trent)',
      opened: '27 min ago',
      status: 'ACTIVE',
      slaRemaining: '18m remaining',
      priority: 'P0 - Critical Incident',
      category: 'Command & Control',
      impactScore: '92 / 100',
      summary: 'Host DEV-WS-019 established an encrypted channel to an unclassified foreign IP with jittered intervals matching known Cobalt Strike malleable C2 profiles. 42 MB of encrypted egress traffic observed.',
      timeline: [
        { time: '07:45 UTC', title: 'Initial Beacon Observed', desc: 'Deep Packet Inspection on EDGE-FW-01 detected TLS handshake to IP 203.0.113.88.' },
        { time: '07:55 UTC', title: 'Threat Score Escalate', desc: 'Correlation engine matched jitter and packet size distributions with C2 profile.' },
        { time: '08:02 UTC', title: 'Incident Created', desc: 'Automated P0 dispatch to Threat Hunting Squad.' },
        { time: '08:08 UTC', title: 'Host Network Isolation', desc: 'EDR command issued to isolate DEV-WS-019 at the NDIS driver level.' }
      ],
      indicators: [
        '203.0.113.88 (NL / AS16276)',
        'Domain: telemetry-cdn-sync.cloud-edge.live',
        'Hash: 7b9c6f24a1b8d34e9e115024d4567ac89ef32194c7b6540321aef789456123cd'
      ],
      notes: [
        { author: 'Marcus Trent', time: '08:15 UTC', text: 'Endpoint isolated successfully. Memory dump acquired and undergoing volatile artifact extraction.' }
      ],
      containmentActions: [
        { name: 'Isolate host from enterprise network', done: true },
        { name: 'Block destination IP on core firewalls', done: true },
        { name: 'Perform differential disk analysis', done: false },
        { name: 'Interview developer regarding recently installed npm packages', done: false }
      ]
    },
    {
      id: 'INC-4027',
      title: 'Endpoint Policy Violation & Tamper Detection',
      severity: 'MEDIUM',
      affectedAssets: ['ENG-LT-042', 'EDR-SERVICE-AGENT'],
      assignedTeam: 'Fleet Security (Lead: Sarah Lin)',
      opened: '41 min ago',
      status: 'INVESTIGATING',
      slaRemaining: '2h 15m remaining',
      priority: 'P2 - Medium Priority',
      category: 'Policy Compliance',
      impactScore: '51 / 100',
      summary: 'Kernel driver tamper alert triggered when a non-whitelisted binary attempted to unload the Aegis EDR kernel filter driver. Kernel integrity remained intact.',
      timeline: [
        { time: '07:32 UTC', title: 'Driver Unhook Blocked', desc: 'Kernel-level protection halted DriverUnload request from PID 4120.' },
        { time: '07:40 UTC', title: 'Automatic Fleet Quarantine', desc: 'Device restricted to internal remediation VLAN.' }
      ],
      indicators: [
        'Binary: dev-kernel-probe.sys',
        'Host: ENG-LT-042 (10.240.14.88)'
      ],
      notes: [
        { author: 'Sarah Lin', time: '08:00 UTC', text: 'Developer states they were compiling a custom eBPF networking probe. Validating signing keys.' }
      ],
      containmentActions: [
        { name: 'Quarantine offending sys file', done: true },
        { name: 'Verify kernel code integrity via secure boot log', done: true },
        { name: 'Provide approved sandbox environment for eBPF testing', done: false }
      ]
    },
    {
      id: 'INC-4025',
      title: 'Supply Chain Dependency Hash Deviation',
      severity: 'LOW',
      affectedAssets: ['CI-RUNNER-04', 'NPM-PROXY-CACHE'],
      assignedTeam: 'AppSec Team (Lead: Dev Sharma)',
      opened: '1h 15m ago',
      status: 'RESOLVED',
      slaRemaining: 'Met',
      priority: 'P3 - Low Priority',
      category: 'AppSec / Supply Chain',
      impactScore: '30 / 100',
      summary: 'Package hash mismatch detected during build pipeline invocation for package @internal/crypto-utils. Upstream cache verified and cleared. No malicious payload detected.',
      timeline: [
        { time: '06:45 UTC', title: 'Checksum Mismatch', desc: 'SHA-512 check failed during yarn install in CI-RUNNER-04.' },
        { time: '07:10 UTC', title: 'Artifact Validation', desc: 'Package source verified against internal Git commit tree. Found benign line-ending difference.' },
        { time: '07:30 UTC', title: 'Resolved', desc: 'CI pipeline cache re-indexed and job re-run successfully.' }
      ],
      indicators: [
        'Package: @internal/crypto-utils@2.4.1',
        'Runner: CI-RUNNER-04'
      ],
      notes: [
        { author: 'Dev Sharma', time: '07:25 UTC', text: 'False positive caused by CRLF to LF git checkout configuration on new Windows runner.' }
      ],
      containmentActions: [
        { name: 'Re-index artifact repository', done: true },
        { name: 'Standardize runner git autocrlf settings', done: true }
      ]
    },
    {
      id: 'INC-4021',
      title: 'Lateral Movement Detected in Staging VPC',
      severity: 'HIGH',
      affectedAssets: ['STAGE-API-01', 'STAGE-DB-02', 'VPC-ROUTER-EAST'],
      assignedTeam: 'SecOps Alpha (Lead: Alex Vance)',
      opened: '2h 10m ago',
      status: 'RESOLVED',
      slaRemaining: 'Met',
      priority: 'P1 - High Priority',
      category: 'Network Intrusion',
      impactScore: '78 / 100',
      summary: 'Automated network scan originated from compromised staging Kubernetes pod scanning adjacent database subnets on port 5432 and 6379. Staging cluster isolated and pod terminated.',
      timeline: [
        { time: '05:55 UTC', title: 'Port Sweep Alert', desc: '1,200 SYN packets sent in 15 seconds across 10.240.8.0/24 subnet.' },
        { time: '06:05 UTC', title: 'Pod Quarantine', desc: 'K8s admission webhook evicted suspicious replica pod.' },
        { time: '06:30 UTC', title: 'VPC Security Group Hardened', desc: 'East-west staging rules tightened to deny cross-namespace traffic.' }
      ],
      indicators: [
        'Source: pod/data-indexer-784f4-9kz1',
        'Subnet: 10.240.8.0/24'
      ],
      notes: [
        { author: 'Alex Vance', time: '06:45 UTC', text: 'Post-mortem completed. Pod had exposed metrics endpoint with RCE vulnerability in third-party library.' }
      ],
      containmentActions: [
        { name: 'Terminate rogue pod and lock deployment', done: true },
        { name: 'Review staging egress firewalls', done: true }
      ]
    }
  ];

  const endpoints = [
    {
      device: 'ENG-LT-042',
      type: 'Laptop',
      os: 'Windows 11 Enterprise (23H2)',
      ip: '10.240.14.88',
      mac: '00:1B:44:11:3A:B7',
      assignedUser: 'Marcus Harrison (Staff Engineer)',
      risk: 'Critical',
      lastSeen: '2 min ago',
      agentVersion: 'v4.18.2 (Compliant)',
      status: 'Attention',
      department: 'Platform Engineering',
      openSockets: ['443/TCP (Outbound)', '53/UDP (DNS)', '135/TCP (RPC)', '8443/TCP (Flagged)'],
      processes: [
        { name: 'powershell.exe', pid: 8912, status: 'SUSPENDED', signer: 'Microsoft Windows' },
        { name: 'slack.exe', pid: 4120, status: 'RUNNING', signer: 'Slack Technologies LLC' },
        { name: 'chrome.exe', pid: 6544, status: 'RUNNING', signer: 'Google LLC' },
        { name: 'AegisAgent.exe', pid: 1024, status: 'RUNNING', signer: 'Aegis Security Inc.' }
      ]
    },
    {
      device: 'OPS-SRV-08',
      type: 'Server',
      os: 'Ubuntu 22.04.4 LTS',
      ip: '172.16.8.22',
      mac: '00:50:56:9A:12:F4',
      assignedUser: 'Infra Automation / svc_ansible',
      risk: 'Medium',
      lastSeen: '1 min ago',
      agentVersion: 'v4.18.2 (Compliant)',
      status: 'Protected',
      department: 'Site Reliability Engineering',
      openSockets: ['22/TCP (SSH)', '443/TCP (HTTPS)', '9100/TCP (Prometheus)'],
      processes: [
        { name: 'sshd', pid: 1420, status: 'RUNNING', signer: 'Canonical Ltd.' },
        { name: 'dockerd', pid: 2100, status: 'RUNNING', signer: 'Docker Inc.' },
        { name: 'aegis-daemon', pid: 880, status: 'RUNNING', signer: 'Aegis Security Inc.' }
      ]
    },
    {
      device: 'DEV-WS-019',
      type: 'Workstation',
      os: 'Windows 11 Enterprise (23H2)',
      ip: '10.100.4.15',
      mac: '2C:F0:5D:88:2E:19',
      assignedUser: 'Chen Wei (Core Dev)',
      risk: 'High',
      lastSeen: '8 min ago',
      agentVersion: 'v4.18.2 (Compliant)',
      status: 'Attention',
      department: 'Application Development',
      openSockets: ['443/TCP', '8443/TCP (Beaconing Intercepted)', '3000/TCP (Dev Server)'],
      processes: [
        { name: 'node.exe', pid: 7120, status: 'RUNNING', signer: 'OpenJS Foundation' },
        { name: 'Code.exe', pid: 5410, status: 'RUNNING', signer: 'Microsoft Corporation' },
        { name: 'AegisAgent.exe', pid: 1102, status: 'RUNNING', signer: 'Aegis Security Inc.' }
      ]
    },
    {
      device: 'AUTH-GW-01',
      type: 'Server',
      os: 'Red Hat Enterprise Linux 9.3',
      ip: '10.240.0.12',
      mac: '52:54:00:1E:8C:3B',
      assignedUser: 'Identity Cluster Cluster-Lead',
      risk: 'High',
      lastSeen: 'Just now',
      agentVersion: 'v4.18.2 (Compliant)',
      status: 'Protected',
      department: 'Identity & Access',
      openSockets: ['443/TCP (Public Auth)', '8443/TCP (Admin Console)', '9090/TCP (Metrics)'],
      processes: [
        { name: 'envoy-auth-proxy', pid: 980, status: 'RUNNING', signer: 'Envoy Project' },
        { name: 'redis-server', pid: 1220, status: 'RUNNING', signer: 'Redis Ltd.' },
        { name: 'aegis-daemon', pid: 812, status: 'RUNNING', signer: 'Aegis Security Inc.' }
      ]
    },
    {
      device: 'PROD-DB-PRIMARY',
      type: 'Server',
      os: 'Debian 12 Bookworm',
      ip: '10.240.1.20',
      mac: '00:15:5D:F3:99:A2',
      assignedUser: 'Database Reliability Team',
      risk: 'Low',
      lastSeen: 'Just now',
      agentVersion: 'v4.18.2 (Compliant)',
      status: 'Protected',
      department: 'Data Infrastructure',
      openSockets: ['5432/TCP (Postgres SSL)', '9187/TCP (PG Exporter)'],
      processes: [
        { name: 'postgres', pid: 1600, status: 'RUNNING', signer: 'PostgreSQL Global Development Group' },
        { name: 'aegis-daemon', pid: 900, status: 'RUNNING', signer: 'Aegis Security Inc.' }
      ]
    },
    {
      device: 'SEC-PROXY-01',
      type: 'Cloud Gateway',
      os: 'Alpine Linux 3.19 (Hardened Kernel)',
      ip: '10.240.0.5',
      mac: '02:42:0A:F0:00:05',
      assignedUser: 'Network Security Automation',
      risk: 'Low',
      lastSeen: 'Just now',
      agentVersion: 'v4.18.2 (Compliant)',
      status: 'Protected',
      department: 'SecOps Infrastructure',
      openSockets: ['80/TCP', '443/TCP', '8080/TCP'],
      processes: [
        { name: 'nginx-ingress', pid: 1045, status: 'RUNNING', signer: 'F5 NGINX' },
        { name: 'aegis-daemon', pid: 742, status: 'RUNNING', signer: 'Aegis Security Inc.' }
      ]
    },
    {
      device: 'KUBE-WORKER-09',
      type: 'Kubernetes Node',
      os: 'Ubuntu 22.04.4 LTS (Kernel 6.5)',
      ip: '10.240.32.19',
      mac: '52:54:00:A1:C9:82',
      assignedUser: 'Kubernetes Cluster Fleet',
      risk: 'Medium',
      lastSeen: 'Just now',
      agentVersion: 'v4.18.2 (Compliant)',
      status: 'Protected',
      department: 'Core Infrastructure',
      openSockets: ['10250/TCP (Kubelet)', '443/TCP', '9100/TCP'],
      processes: [
        { name: 'kubelet', pid: 1120, status: 'RUNNING', signer: 'Cloud Native Computing Foundation' },
        { name: 'containerd', pid: 1300, status: 'RUNNING', signer: 'Containerd Authors' }
      ]
    },
    {
      device: 'FIN-LT-109',
      type: 'Laptop',
      os: 'macOS Sonoma 14.5',
      ip: '10.240.18.55',
      mac: 'F0:18:98:C2:5E:41',
      assignedUser: 'Claire Sterling (CFO Finance Analyst)',
      risk: 'Low',
      lastSeen: '14 min ago',
      agentVersion: 'v4.18.2 (Compliant)',
      status: 'Protected',
      department: 'Corporate Finance',
      openSockets: ['443/TCP', '53/UDP'],
      processes: [
        { name: 'Excel', pid: 3890, status: 'RUNNING', signer: 'Microsoft Corporation' },
        { name: 'AegisAgent.app', pid: 914, status: 'RUNNING', signer: 'Aegis Security Inc.' }
      ]
    },
    {
      device: 'EXEC-MB-003',
      type: 'Laptop',
      os: 'macOS Sonoma 14.5',
      ip: '10.240.18.12',
      mac: '3C:06:30:19:AA:08',
      assignedUser: 'Julian Vance (VP Technology)',
      risk: 'Low',
      lastSeen: '4 min ago',
      agentVersion: 'v4.18.2 (Compliant)',
      status: 'Protected',
      department: 'Executive Office',
      openSockets: ['443/TCP'],
      processes: [
        { name: 'Safari', pid: 2190, status: 'RUNNING', signer: 'Apple Inc.' },
        { name: 'AegisAgent.app', pid: 902, status: 'RUNNING', signer: 'Aegis Security Inc.' }
      ]
    },
    {
      device: 'STAGE-API-01',
      type: 'Server',
      os: 'Debian 12 Bookworm',
      ip: '10.240.8.14',
      mac: '52:54:00:11:D3:FE',
      assignedUser: 'Staging Environment SRE',
      risk: 'Low',
      lastSeen: '3 min ago',
      agentVersion: 'v4.18.2 (Compliant)',
      status: 'Protected',
      department: 'QA & Staging',
      openSockets: ['8080/TCP', '443/TCP'],
      processes: [
        { name: 'java', pid: 4890, status: 'RUNNING', signer: 'Eclipse Temurin' },
        { name: 'aegis-daemon', pid: 912, status: 'RUNNING', signer: 'Aegis Security Inc.' }
      ]
    }
  ];

  const networkTopology = {
    nodes: [
      // Ingress / External
      { id: 'ext-1', label: 'EXT-TOR-EXIT', ip: '185.220.101.5', tier: 'external', type: 'External IP', status: 'critical', x: 80, y: 110, risk: 98, traffic: '1.4 MB/s', connections: ['gw-waf'] },
      { id: 'ext-2', label: 'EXT-PROXY-RU', ip: '198.51.100.42', tier: 'external', type: 'External IP', status: 'critical', x: 80, y: 220, risk: 84, traffic: '3.8 MB/s', connections: ['gw-waf'] },
      { id: 'ext-3', label: 'EXT-CDN-NL', ip: '203.0.113.88', tier: 'external', type: 'External C2', status: 'warning', x: 80, y: 330, risk: 88, traffic: '512 B/s', connections: ['gw-fw'] },
      { id: 'ext-4', label: 'EXT-DNS-SINK', ip: '198.51.100.170', tier: 'external', type: 'External DNS', status: 'warning', x: 80, y: 440, risk: 68, traffic: '128 KB/s', connections: ['gw-fw'] },
      
      // Gateway / Perimeter Tier
      { id: 'gw-waf', label: 'CLOUDFLARE-WAF', ip: '172.64.0.1', tier: 'gateway', type: 'Edge WAF', status: 'healthy', x: 260, y: 150, risk: 14, traffic: '182 MB/s', connections: ['core-gw', 'core-auth'] },
      { id: 'gw-fw', label: 'PERIMETER-FIREWALL', ip: '10.240.0.1', tier: 'gateway', type: 'NextGen FW', status: 'healthy', x: 260, y: 380, risk: 22, traffic: '94 MB/s', connections: ['core-switch', 'core-gw'] },

      // Core Infrastructure Tier
      { id: 'core-auth', label: 'AUTH-GW-01', ip: '10.240.0.12', tier: 'core', type: 'Auth Gateway', status: 'warning', x: 460, y: 120, risk: 74, traffic: '14.2 MB/s', connections: ['srv-idp', 'srv-db'] },
      { id: 'core-gw', label: 'CORE-API-GW', ip: '10.240.0.18', tier: 'core', type: 'API Gateway', status: 'healthy', x: 460, y: 260, risk: 28, traffic: '68.4 MB/s', connections: ['srv-kube', 'srv-db', 'srv-app'] },
      { id: 'core-switch', label: 'CORE-VPC-ROUTER', ip: '10.240.0.2', tier: 'core', type: 'VPC Router', status: 'healthy', x: 460, y: 420, risk: 18, traffic: '142 MB/s', connections: ['ep-switch', 'srv-kube'] },

      // Server & Workload Tier
      { id: 'srv-db', label: 'PROD-DB-PRIMARY', ip: '10.240.1.20', tier: 'server', type: 'Postgres Cluster', status: 'healthy', x: 670, y: 110, risk: 12, traffic: '32.1 MB/s', connections: ['srv-app'] },
      { id: 'srv-app', label: 'PROD-APP-CLUSTER', ip: '10.240.2.10', tier: 'server', type: 'Microservices Fleet', status: 'healthy', x: 670, y: 220, risk: 16, traffic: '45.0 MB/s', connections: ['srv-kube'] },
      { id: 'srv-kube', label: 'KUBE-WORKER-09', ip: '10.240.32.19', tier: 'server', type: 'K8s Cluster Node', status: 'warning', x: 670, y: 340, risk: 58, traffic: '28.9 MB/s', connections: ['ep-dev'] },
      { id: 'srv-idp', label: 'PROD-IDP-02', ip: '10.240.1.5', tier: 'server', type: 'Directory / Kerberos', status: 'healthy', x: 670, y: 460, risk: 24, traffic: '8.2 MB/s', connections: ['ep-ops'] },

      // Endpoints Tier
      { id: 'ep-switch', label: 'ACCESS-SWITCH-ENG', ip: '10.240.14.1', tier: 'endpoint', type: 'VLAN Switch', status: 'healthy', x: 860, y: 420, risk: 15, traffic: '52 MB/s', connections: ['ep-eng', 'ep-dev', 'ep-ops', 'ep-fin'] },
      { id: 'ep-eng', label: 'ENG-LT-042', ip: '10.240.14.88', tier: 'endpoint', type: 'Staff Laptop (Win11)', status: 'critical', x: 970, y: 130, risk: 96, traffic: '1.2 MB/s', connections: ['core-auth'] },
      { id: 'ep-dev', label: 'DEV-WS-019', ip: '10.100.4.15', tier: 'endpoint', type: 'Workstation (Win11)', status: 'critical', x: 970, y: 240, risk: 88, traffic: '4.8 MB/s', connections: ['gw-fw'] },
      { id: 'ep-ops', label: 'OPS-SRV-08', ip: '172.16.8.22', tier: 'endpoint', type: 'Linux Bastion Host', status: 'warning', x: 970, y: 360, risk: 62, traffic: '2.4 MB/s', connections: ['srv-idp'] },
      { id: 'ep-fin', label: 'FIN-LT-109', ip: '10.240.18.55', tier: 'endpoint', type: 'Finance MacBook', status: 'healthy', x: 970, y: 480, risk: 8, traffic: '0.8 MB/s', connections: ['core-gw'] }
    ],
    connections: [
      { from: 'ext-1', to: 'gw-waf', status: 'critical', protocol: 'HTTP/2 Exploit Probe', latency: '42ms' },
      { from: 'ext-2', to: 'gw-waf', status: 'critical', protocol: 'TLS 1.3 Credential Flood', latency: '65ms' },
      { from: 'ext-3', to: 'gw-fw', status: 'warning', protocol: 'TCP 8443 Jittered Beacon', latency: '38ms' },
      { from: 'ext-4', to: 'gw-fw', status: 'warning', protocol: 'UDP 53 DNS Tunneling', latency: '82ms' },
      { from: 'gw-waf', to: 'core-auth', status: 'warning', protocol: 'mTLS HTTP/2', latency: '2ms' },
      { from: 'gw-waf', to: 'core-gw', status: 'healthy', protocol: 'gRPC v2', latency: '1ms' },
      { from: 'gw-fw', to: 'core-switch', status: 'healthy', protocol: 'VLAN Trunk 10G', latency: '1ms' },
      { from: 'gw-fw', to: 'core-gw', status: 'healthy', protocol: 'VXLAN Overlay', latency: '1ms' },
      { from: 'core-auth', to: 'srv-idp', status: 'healthy', protocol: 'LDAP / Kerberos', latency: '2ms' },
      { from: 'core-auth', to: 'srv-db', status: 'healthy', protocol: 'PostgreSQL TLS', latency: '1ms' },
      { from: 'core-gw', to: 'srv-app', status: 'healthy', protocol: 'HTTP/2 REST', latency: '1ms' },
      { from: 'core-gw', to: 'srv-kube', status: 'healthy', protocol: 'gRPC Microservices', latency: '2ms' },
      { from: 'core-switch', to: 'ep-switch', status: 'healthy', protocol: 'Fiber 40Gbps', latency: '1ms' },
      { from: 'core-switch', to: 'srv-kube', status: 'healthy', protocol: 'Kube Overlay CNI', latency: '2ms' },
      { from: 'srv-app', to: 'srv-db', status: 'healthy', protocol: 'SQL Pool 5432', latency: '1ms' },
      { from: 'ep-switch', to: 'ep-eng', status: 'critical', protocol: '802.1X Auth', latency: '3ms' },
      { from: 'ep-switch', to: 'ep-dev', status: 'critical', protocol: '802.1X Auth', latency: '2ms' },
      { from: 'ep-switch', to: 'ep-ops', status: 'warning', protocol: 'SSH Bastion', latency: '2ms' },
      { from: 'ep-switch', to: 'ep-fin', status: 'healthy', protocol: 'WPA3 Enterprise', latency: '4ms' },
      { from: 'ep-dev', to: 'gw-fw', status: 'critical', protocol: 'Direct TCP 8443 (Quarantined)', latency: '38ms' }
    ]
  };

  const analyticsData = {
    '24H': {
      summary: {
        totalThreats: 142,
        blockedThreats: 135,
        investigatedThreats: 7,
        blockRate: '95.1%',
        eventsAnalyzed: '24,812',
        mttrAvg: '4.2m',
        mttrChange: '-18.4%',
        activeAnomalies: 9
      },
      threatTimeline: [
        { time: '00:00', blocked: 12, investigated: 0 },
        { time: '02:00', blocked: 8, investigated: 1 },
        { time: '04:00', blocked: 14, investigated: 0 },
        { time: '06:00', blocked: 28, investigated: 2 },
        { time: '08:00', blocked: 34, investigated: 3 },
        { time: '10:00', blocked: 19, investigated: 1 },
        { time: '12:00', blocked: 22, investigated: 0 }
      ],
      eventCategories: [
        { label: 'Authentication & Credential Spikes', count: 9840, percentage: 39.6, color: '#38bdf8' },
        { label: 'Network Probing & Port Sweeps', count: 6420, percentage: 25.8, color: '#00f2fe' },
        { label: 'EDR Behavioral / In-Memory Suspicion', count: 4120, percentage: 16.6, color: '#f59e0b' },
        { label: 'DNS / C2 Tunneling Heuristics', count: 2840, percentage: 11.4, color: '#f97316' },
        { label: 'Privilege & Cloud IAM Anomalies', count: 1592, percentage: 6.6, color: '#ef4444' }
      ],
      attackVectors: [
        { name: 'Credential Abuse', score: 82, count: '14.2K' },
        { name: 'API Exploitation', score: 68, count: '6.8K' },
        { name: 'C2 Beaconing', score: 54, count: '3.1K' },
        { name: 'Malware Droppers', score: 41, count: '1.4K' },
        { name: 'Lateral Movement', score: 29, count: '890' }
      ],
      endpointHealthBreakdown: {
        healthy: 1248,
        warning: 28,
        critical: 8
      }
    },
    '7D': {
      summary: {
        totalThreats: 984,
        blockedThreats: 942,
        investigatedThreats: 42,
        blockRate: '95.7%',
        eventsAnalyzed: '168,410',
        mttrAvg: '5.1m',
        mttrChange: '-22.0%',
        activeAnomalies: 23
      },
      threatTimeline: [
        { time: 'Mon', blocked: 120, investigated: 4 },
        { time: 'Tue', blocked: 145, investigated: 7 },
        { time: 'Wed', blocked: 162, investigated: 8 },
        { time: 'Thu', blocked: 138, investigated: 5 },
        { time: 'Fri', blocked: 154, investigated: 9 },
        { time: 'Sat', blocked: 108, investigated: 4 },
        { time: 'Sun', blocked: 115, investigated: 5 }
      ],
      eventCategories: [
        { label: 'Authentication & Credential Spikes', count: 65400, percentage: 38.8, color: '#38bdf8' },
        { label: 'Network Probing & Port Sweeps', count: 44200, percentage: 26.2, color: '#00f2fe' },
        { label: 'EDR Behavioral / In-Memory Suspicion', count: 28100, percentage: 16.7, color: '#f59e0b' },
        { label: 'DNS / C2 Tunneling Heuristics', count: 18900, percentage: 11.2, color: '#f97316' },
        { label: 'Privilege & Cloud IAM Anomalies', count: 11810, percentage: 7.1, color: '#ef4444' }
      ],
      attackVectors: [
        { name: 'Credential Abuse', score: 86, count: '94.2K' },
        { name: 'API Exploitation', score: 71, count: '46.8K' },
        { name: 'C2 Beaconing', score: 58, count: '21.1K' },
        { name: 'Malware Droppers', score: 45, count: '9.4K' },
        { name: 'Lateral Movement', score: 34, count: '5.8K' }
      ],
      endpointHealthBreakdown: {
        healthy: 1239,
        warning: 34,
        critical: 11
      }
    },
    '30D': {
      summary: {
        totalThreats: 4120,
        blockedThreats: 3960,
        investigatedThreats: 160,
        blockRate: '96.1%',
        eventsAnalyzed: '724,190',
        mttrAvg: '6.4m',
        mttrChange: '-28.5%',
        activeAnomalies: 84
      },
      threatTimeline: [
        { time: 'Week 1', blocked: 940, investigated: 38 },
        { time: 'Week 2', blocked: 1040, investigated: 42 },
        { time: 'Week 3', blocked: 990, investigated: 44 },
        { time: 'Week 4', blocked: 990, investigated: 36 }
      ],
      eventCategories: [
        { label: 'Authentication & Credential Spikes', count: 278000, percentage: 38.4, color: '#38bdf8' },
        { label: 'Network Probing & Port Sweeps', count: 192000, percentage: 26.5, color: '#00f2fe' },
        { label: 'EDR Behavioral / In-Memory Suspicion', count: 122000, percentage: 16.8, color: '#f59e0b' },
        { label: 'DNS / C2 Tunneling Heuristics', count: 80000, percentage: 11.0, color: '#f97316' },
        { label: 'Privilege & Cloud IAM Anomalies', count: 52190, percentage: 7.3, color: '#ef4444' }
      ],
      attackVectors: [
        { name: 'Credential Abuse', score: 89, count: '410K' },
        { name: 'API Exploitation', score: 74, count: '198K' },
        { name: 'C2 Beaconing', score: 62, count: '89K' },
        { name: 'Malware Droppers', score: 48, count: '41K' },
        { name: 'Lateral Movement', score: 37, count: '24K' }
      ],
      endpointHealthBreakdown: {
        healthy: 1222,
        warning: 46,
        critical: 16
      }
    },
    '90D': {
      summary: {
        totalThreats: 12480,
        blockedThreats: 12050,
        investigatedThreats: 430,
        blockRate: '96.5%',
        eventsAnalyzed: '2,189,400',
        mttrAvg: '7.8m',
        mttrChange: '-34.2%',
        activeAnomalies: 240
      },
      threatTimeline: [
        { time: 'Month 1', blocked: 3900, investigated: 140 },
        { time: 'Month 2', blocked: 4100, investigated: 150 },
        { time: 'Month 3', blocked: 4050, investigated: 140 }
      ],
      eventCategories: [
        { label: 'Authentication & Credential Spikes', count: 842000, percentage: 38.4, color: '#38bdf8' },
        { label: 'Network Probing & Port Sweeps', count: 580000, percentage: 26.5, color: '#00f2fe' },
        { label: 'EDR Behavioral / In-Memory Suspicion', count: 368000, percentage: 16.8, color: '#f59e0b' },
        { label: 'DNS / C2 Tunneling Heuristics', count: 242000, percentage: 11.1, color: '#f97316' },
        { label: 'Privilege & Cloud IAM Anomalies', count: 157400, percentage: 7.2, color: '#ef4444' }
      ],
      attackVectors: [
        { name: 'Credential Abuse', score: 91, count: '1.2M' },
        { name: 'API Exploitation', score: 76, count: '580K' },
        { name: 'C2 Beaconing', score: 65, count: '260K' },
        { name: 'Malware Droppers', score: 50, count: '120K' },
        { name: 'Lateral Movement', score: 39, count: '74K' }
      ],
      endpointHealthBreakdown: {
        healthy: 1210,
        warning: 54,
        critical: 20
      }
    }
  };

  const notifications = [
    {
      id: 'NOTIF-101',
      title: 'Critical Threat Intercepted',
      message: 'Suspicious in-memory PowerShell injection blocked on ENG-LT-042.',
      time: '12m ago',
      type: 'critical',
      read: false,
      route: 'threats',
      targetId: 'THR-8089'
    },
    {
      id: 'NOTIF-102',
      title: 'P0 Incident Escalated',
      message: 'Outbound C2 connection on port 8443 assigned to Threat Hunting Squad.',
      time: '27m ago',
      type: 'high',
      read: false,
      route: 'incidents',
      targetId: 'INC-4028'
    },
    {
      id: 'NOTIF-103',
      title: 'Topology Sensor Alert',
      message: 'High latency jitter spike observed on CORE-API-GW-01 to WAF trunk.',
      time: '45m ago',
      type: 'warning',
      read: true,
      route: 'network',
      targetId: 'gw-waf'
    },
    {
      id: 'NOTIF-104',
      title: 'Automated Quarantine Complete',
      message: 'Workstation DEV-WS-019 network driver locked to internal sinkhole.',
      time: '1h ago',
      type: 'success',
      read: true,
      route: 'endpoints',
      targetId: 'DEV-WS-019'
    }
  ];

  return {
    systemHealth,
    threats,
    incidents,
    endpoints,
    networkTopology,
    analyticsData,
    notifications
  };
})();
