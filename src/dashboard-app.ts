import { LitElement, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";

/* ── Types ── */

interface CronJob {
  name: string;
  schedule: string;
  scheduleType: "every" | "at" | "cron";
  enabled: boolean;
  lastRun: string;
  nextRun: string;
  payload: string;
}

interface Session {
  key: string;
  label: string;
  kind: string;
  updated: string;
  tokens: number;
  thinkingLevel: string;
}

interface UsageDay {
  date: string;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  cacheRead: number;
  cacheWrite: number;
}

interface ConfigSetting {
  key: string;
  label: string;
  value: string;
  type: "text" | "number" | "toggle" | "select";
  options?: string[];
  description: string;
  section: string;
}

type ViewId = "overview" | "cron" | "sessions" | "usage" | "config";
type GatewayStatus = "connected" | "disconnected" | "checking";

/* ── Mock Data ── */

const MOCK_CRON_JOBS: CronJob[] = [
  {
    name: "daily-summary",
    schedule: "every 24h",
    scheduleType: "every",
    enabled: true,
    lastRun: "2025-07-21T08:00:00Z",
    nextRun: "2025-07-22T08:00:00Z",
    payload: '{"channel": "general", "type": "summary"}',
  },
  {
    name: "weekly-report",
    schedule: "at Monday 09:00",
    scheduleType: "at",
    enabled: true,
    lastRun: "2025-07-14T09:00:00Z",
    nextRun: "2025-07-21T09:00:00Z",
    payload: '{"channel": "reports", "format": "markdown"}',
  },
  {
    name: "health-check",
    schedule: "cron 0 */6 * * *",
    scheduleType: "cron",
    enabled: false,
    lastRun: "2025-07-21T06:00:00Z",
    nextRun: "2025-07-21T12:00:00Z",
    payload: '{"endpoint": "/health", "timeout": 30}',
  },
];

const MOCK_SESSIONS: Session[] = [
  { key: "sess_a1b2c3", label: "Code Review Agent", kind: "agent", updated: "2025-07-21T14:32:00Z", tokens: 12480, thinkingLevel: "high" },
  { key: "sess_d4e5f6", label: "Chat Assistant", kind: "chat", updated: "2025-07-21T13:15:00Z", tokens: 8320, thinkingLevel: "medium" },
  { key: "sess_g7h8i9", label: "Data Pipeline", kind: "task", updated: "2025-07-21T12:00:00Z", tokens: 24100, thinkingLevel: "low" },
  { key: "sess_j0k1l2", label: "Global Context", kind: "global", updated: "2025-07-21T11:45:00Z", tokens: 3200, thinkingLevel: "none" },
  { key: "sess_m3n4o5", label: "Unknown Session", kind: "unknown", updated: "2025-07-20T22:10:00Z", tokens: 640, thinkingLevel: "medium" },
];

const MOCK_USAGE: UsageDay[] = [
  { date: "2025-07-15", cost: 1.24, inputTokens: 48200, outputTokens: 12400, cacheRead: 32000, cacheWrite: 4800 },
  { date: "2025-07-16", cost: 2.18, inputTokens: 84000, outputTokens: 21600, cacheRead: 56000, cacheWrite: 8400 },
  { date: "2025-07-17", cost: 0.87, inputTokens: 33600, outputTokens: 8700, cacheRead: 22400, cacheWrite: 3360 },
  { date: "2025-07-18", cost: 3.42, inputTokens: 132000, outputTokens: 34200, cacheRead: 88000, cacheWrite: 13200 },
  { date: "2025-07-19", cost: 1.96, inputTokens: 75600, outputTokens: 19600, cacheRead: 50400, cacheWrite: 7560 },
  { date: "2025-07-20", cost: 0.53, inputTokens: 20400, outputTokens: 5300, cacheRead: 13600, cacheWrite: 2040 },
  { date: "2025-07-21", cost: 2.75, inputTokens: 106000, outputTokens: 27500, cacheRead: 70600, cacheWrite: 10600 },
];

const MOCK_CONFIG: ConfigSetting[] = [
  // General
  { key: "app_name", label: "Application Name", value: "OpenClaw", type: "text", description: "Display name for this OpenClaw instance.", section: "General" },
  { key: "log_level", label: "Log Level", value: "info", type: "select", options: ["debug", "info", "warn", "error"], description: "Minimum log level for output. Lower levels produce more verbose logs.", section: "General" },
  { key: "timezone", label: "Timezone", value: "UTC", type: "text", description: "IANA timezone string used for scheduling and display.", section: "General" },
  // Gateway
  { key: "gateway_port", label: "Gateway Port", value: "18789", type: "number", description: "TCP port the gateway listens on for incoming WebSocket connections.", section: "Gateway" },
  { key: "gateway_host", label: "Gateway Host", value: "127.0.0.1", type: "text", description: "Bind address for the gateway server.", section: "Gateway" },
  { key: "gateway_token", label: "Gateway Token", value: "oc_live_xxxxxxxxxxxx", type: "text", description: "Bearer token required to authenticate with the gateway.", section: "Gateway" },
  { key: "health_endpoint", label: "Health Endpoint", value: "/health", type: "text", description: "HTTP path that returns gateway health status.", section: "Gateway" },
  // Auth
  { key: "auth_enabled", label: "Authentication", value: "true", type: "toggle", description: "Enable or disable token-based authentication for all API requests.", section: "Auth" },
  { key: "token_expiry", label: "Token Expiry (hours)", value: "72", type: "number", description: "Number of hours before an authentication token expires.", section: "Auth" },
  { key: "max_failed_attempts", label: "Max Failed Attempts", value: "5", type: "number", description: "Lock account after this many consecutive failed login attempts.", section: "Auth" },
  // Agents
  { key: "default_model", label: "Default Model", value: "claude-sonnet-4-20250514", type: "text", description: "Default LLM model used when no model is specified per agent.", section: "Agents" },
  { key: "max_tokens", label: "Max Tokens", value: "8192", type: "number", description: "Maximum number of tokens per completion request.", section: "Agents" },
  { key: "temperature", label: "Temperature", value: "0.7", type: "text", description: "Sampling temperature for LLM responses (0.0–2.0).", section: "Agents" },
  { key: "thinking_budget", label: "Thinking Budget", value: "10000", type: "number", description: "Maximum tokens allocated to extended thinking.", section: "Agents" },
  // Channels
  { key: "default_channel", label: "Default Channel", value: "general", type: "text", description: "Channel name used when no channel is specified.", section: "Channels" },
  { key: "max_channels", label: "Max Channels", value: "50", type: "number", description: "Maximum number of channels allowed.", section: "Channels" },
  { key: "channel_history", label: "History Retention (days)", value: "30", type: "number", description: "Number of days to retain channel message history.", section: "Channels" },
  // Cron
  { key: "cron_enabled", label: "Cron Scheduler", value: "true", type: "toggle", description: "Enable or disable the cron job scheduler globally.", section: "Cron" },
  { key: "cron_tick_interval", label: "Tick Interval (s)", value: "60", type: "number", description: "How often the scheduler checks for jobs to run, in seconds.", section: "Cron" },
  { key: "max_cron_jobs", label: "Max Cron Jobs", value: "100", type: "number", description: "Maximum number of cron jobs that can be registered.", section: "Cron" },
  // Session
  { key: "session_timeout", label: "Session Timeout (min)", value: "30", type: "number", description: "Minutes of inactivity before a session is automatically closed.", section: "Session" },
  { key: "max_sessions", label: "Max Concurrent Sessions", value: "20", type: "number", description: "Maximum number of sessions that can be active simultaneously.", section: "Session" },
  { key: "session_persist", label: "Persist Sessions", value: "true", type: "toggle", description: "Whether to persist session data to disk for recovery after restart.", section: "Session" },
];

const CONFIG_SECTIONS = ["General", "Gateway", "Auth", "Agents", "Channels", "Cron", "Session"] as const;

/* ── Component ── */

@customElement("openclaw-dashboard")
export class OpenClawDashboard extends LitElement {
  // Render into light DOM so external styles.css applies
  override createRenderRoot() {
    return this;
  }

  /* ── State ── */
  @state() private currentView: ViewId = "overview";
  @state() private gatewayStatus: GatewayStatus = "disconnected";
  @state() private gatewayUrl = "ws://127.0.0.1:18789";
  @state() private gatewayToken = "";
  @state() private autoCheckEnabled = true;

  @state() private cronJobs: CronJob[] = [...MOCK_CRON_JOBS];
  @state() private sessions: Session[] = [...MOCK_SESSIONS];
  @state() private usageData: UsageDay[] = [...MOCK_USAGE];
  @state() private configSettings: ConfigSetting[] = MOCK_CONFIG.map((s) => ({ ...s }));

  // Cron form
  @state() private newCronName = "";
  @state() private newCronScheduleType: "every" | "at" | "cron" = "every";
  @state() private newCronSchedule = "";
  @state() private newCronPayload = "";

  // Session filters
  @state() private sessionActiveMinutes = 60;
  @state() private sessionLimit = 50;
  @state() private sessionShowGlobal = true;
  @state() private sessionShowUnknown = false;

  // Usage date range
  @state() private usageDateFrom = "2025-07-15";
  @state() private usageDateTo = "2025-07-21";

  // Config active section
  @state() private activeConfigSection = "General";

  private _healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  /* ── Lifecycle ── */

  override connectedCallback() {
    super.connectedCallback();
    this._startHealthCheck();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._stopHealthCheck();
  }

  private _startHealthCheck() {
    if (!this.autoCheckEnabled) return;
    this._checkGateway();
    this._healthCheckInterval = setInterval(() => this._checkGateway(), 5000);
  }

  private _stopHealthCheck() {
    if (this._healthCheckInterval !== null) {
      clearInterval(this._healthCheckInterval);
      this._healthCheckInterval = null;
    }
  }

  private async _checkGateway() {
    if (!this.autoCheckEnabled) return;
    const httpUrl = this.gatewayUrl
      .replace(/^ws:/, "http:")
      .replace(/^wss:/, "https:");
    this.gatewayStatus = "checking";
    try {
      const resp = await fetch(`${httpUrl}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      this.gatewayStatus = resp.ok ? "connected" : "disconnected";
    } catch {
      this.gatewayStatus = "disconnected";
    }
  }

  /* ── Helpers ── */

  private _nav(view: ViewId) {
    this.currentView = view;
  }

  private _formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  private _shortDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return iso;
    }
  }

  /* ── Cron Actions ── */

  private _addCronJob() {
    if (!this.newCronName.trim() || !this.newCronSchedule.trim()) return;
    const job: CronJob = {
      name: this.newCronName.trim(),
      schedule: `${this.newCronScheduleType} ${this.newCronSchedule.trim()}`,
      scheduleType: this.newCronScheduleType,
      enabled: true,
      lastRun: "—",
      nextRun: new Date(Date.now() + 3600000).toISOString(),
      payload: this.newCronPayload || "{}",
    };
    this.cronJobs = [...this.cronJobs, job];
    this.newCronName = "";
    this.newCronSchedule = "";
    this.newCronPayload = "";
  }

  private _toggleCronJob(index: number) {
    this.cronJobs = this.cronJobs.map((j, i) =>
      i === index ? { ...j, enabled: !j.enabled } : j
    );
  }

  private _removeCronJob(index: number) {
    this.cronJobs = this.cronJobs.filter((_, i) => i !== index);
  }

  private _runCronJob(index: number) {
    this.cronJobs = this.cronJobs.map((j, i) =>
      i === index ? { ...j, lastRun: new Date().toISOString() } : j
    );
  }

  /* ── Session Actions ── */

  private _deleteSession(key: string) {
    this.sessions = this.sessions.filter((s) => s.key !== key);
  }

  private get _filteredSessions(): Session[] {
    return this.sessions.filter((s) => {
      if (!this.sessionShowGlobal && s.kind === "global") return false;
      if (!this.sessionShowUnknown && s.kind === "unknown") return false;
      return true;
    }).slice(0, this.sessionLimit);
  }

  /* ── Config Actions ── */

  private _updateConfig(key: string, value: string) {
    this.configSettings = this.configSettings.map((s) =>
      s.key === key ? { ...s, value } : s
    );
  }

  /* ── Usage Computations ── */

  private get _filteredUsage(): UsageDay[] {
    return this.usageData.filter(
      (d) => d.date >= this.usageDateFrom && d.date <= this.usageDateTo
    );
  }

  private get _usageTotals() {
    const data = this._filteredUsage;
    const totalCost = data.reduce((s, d) => s + d.cost, 0);
    const totalInput = data.reduce((s, d) => s + d.inputTokens, 0);
    const totalOutput = data.reduce((s, d) => s + d.outputTokens, 0);
    const totalCacheRead = data.reduce((s, d) => s + d.cacheRead, 0);
    const totalCacheWrite = data.reduce((s, d) => s + d.cacheWrite, 0);
    const totalTokens = totalInput + totalOutput + totalCacheRead + totalCacheWrite;
    return { totalCost, totalInput, totalOutput, totalCacheRead, totalCacheWrite, totalTokens };
  }

  /* ── Render ── */

  override render() {
    return html`
      <div class="app-layout">
        ${this._renderSidebar()}
        <main class="main-content">
          ${this.currentView === "overview" ? this._renderOverview() : nothing}
          ${this.currentView === "cron" ? this._renderCron() : nothing}
          ${this.currentView === "sessions" ? this._renderSessions() : nothing}
          ${this.currentView === "usage" ? this._renderUsage() : nothing}
          ${this.currentView === "config" ? this._renderConfig() : nothing}
        </main>
      </div>
    `;
  }

  /* ── Sidebar ── */

  private _renderSidebar() {
    const items: { id: ViewId; label: string; icon: string }[] = [
      { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
      { id: "cron", label: "Cron Jobs", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
      { id: "sessions", label: "Sessions", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
      { id: "usage", label: "Usage & Costs", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      { id: "config", label: "Config", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
    ];

    return html`
      <aside class="sidebar">
        <div class="sidebar-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 3c0 3-2 5-2 8a6 6 0 0012 0c0-3-2-5-2-8"/>
            <path d="M12 3c0 3-1 5-1 8"/>
          </svg>
          OpenClaw
        </div>

        <div class="sidebar-section">Navigation</div>
        <nav class="sidebar-nav">
          ${items.map(
            (item) => html`
              <button
                class="nav-item ${this.currentView === item.id ? "active" : ""}"
                data-testid="nav-${item.id}"
                @click=${() => this._nav(item.id)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="${item.icon}" />
                </svg>
                ${item.label}
              </button>
            `
          )}
        </nav>

        <div class="sidebar-footer">
          <div class="gateway-status">
            <span
              class="status-dot ${this.gatewayStatus}"
              data-testid="gateway-status"
            ></span>
            Gateway: ${this.gatewayStatus}
          </div>
        </div>
      </aside>
    `;
  }

  /* ── Overview ── */

  private _renderOverview() {
    const enabledCron = this.cronJobs.filter((j) => j.enabled).length;
    const uptime = "4d 12h 37m";

    return html`
      <div class="page-header">
        <h1 class="page-title">Overview</h1>
        <p class="page-sub">Gateway connection and quick stats</p>
      </div>

      <!-- Connection Card -->
      <div class="card" style="margin-bottom:16px">
        <div class="card-title">Gateway Connection</div>
        <div class="card-sub">Connect to your OpenClaw gateway instance</div>
        <div class="form-grid" style="margin-top:12px">
          <div class="field">
            <span>Gateway URL</span>
            <input
              type="text"
              .value=${this.gatewayUrl}
              @input=${(e: InputEvent) => {
                this.gatewayUrl = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
          <div class="field">
            <span>Token</span>
            <input
              type="password"
              .value=${this.gatewayToken}
              placeholder="oc_live_…"
              @input=${(e: InputEvent) => {
                this.gatewayToken = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
        </div>
        <div class="row" style="margin-top:12px">
          <button class="btn primary" @click=${() => this._checkGateway()}>
            Connect
          </button>
          <span class="chip ${this.gatewayStatus === "connected" ? "chip-ok" : this.gatewayStatus === "checking" ? "chip-warn" : "chip-danger"}">
            ${this.gatewayStatus}
          </span>
        </div>
      </div>

      <!-- Status Snapshot -->
      <div class="card" style="margin-bottom:16px">
        <div class="card-title">Status Snapshot</div>
        <div class="card-sub" style="margin-bottom:8px">Current gateway state</div>
        <div class="row" style="gap:24px">
          <div>
            <span class="muted" style="font-size:12px">Status</span><br />
            <span class="chip ${this.gatewayStatus === "connected" ? "chip-ok" : "chip-danger"}">
              ${this.gatewayStatus === "connected" ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div>
            <span class="muted" style="font-size:12px">Uptime</span><br />
            <span style="font-weight:600">${uptime}</span>
          </div>
          <div>
            <span class="muted" style="font-size:12px">Tick Interval</span><br />
            <span class="mono">60s</span>
          </div>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-4" style="margin-bottom:16px">
        <div class="card stat-card" data-testid="stat-instances">
          <span class="stat-label">Instances</span>
          <span class="stat-value ok">1</span>
          <span class="stat-hint">Running</span>
        </div>
        <div class="card stat-card" data-testid="stat-sessions">
          <span class="stat-label">Sessions</span>
          <span class="stat-value">${this.sessions.length}</span>
          <span class="stat-hint">Active</span>
        </div>
        <div class="card stat-card" data-testid="stat-cron">
          <span class="stat-label">Cron Jobs</span>
          <span class="stat-value">${enabledCron}</span>
          <span class="stat-hint">${this.cronJobs.length} total</span>
        </div>
        <div class="card stat-card" data-testid="stat-uptime">
          <span class="stat-label">Uptime</span>
          <span class="stat-value ok">${uptime}</span>
          <span class="stat-hint">Since Jul 17</span>
        </div>
      </div>

      <!-- Notes -->
      <div class="callout">
        <strong>Tips:</strong> Use the sidebar to navigate between views.
        The gateway auto-detection runs every 5 seconds. You can configure
        settings in the Config view or manage cron jobs from the Cron Jobs view.
      </div>
    `;
  }

  /* ── Cron Jobs ── */

  private _renderCron() {
    const enabledCount = this.cronJobs.filter((j) => j.enabled).length;
    const nextWake = this.cronJobs
      .filter((j) => j.enabled && j.nextRun !== "—")
      .sort((a, b) => a.nextRun.localeCompare(b.nextRun))[0];

    return html`
      <div class="page-header">
        <h1 class="page-title">Cron Jobs</h1>
        <p class="page-sub">Scheduled task management</p>
      </div>

      <!-- Scheduler Status -->
      <div class="card" style="margin-bottom:16px">
        <div class="card-title">Scheduler Status</div>
        <div class="row" style="margin-top:8px;gap:24px">
          <div>
            <span class="muted" style="font-size:12px">Status</span><br />
            <span class="chip chip-ok">Enabled</span>
          </div>
          <div>
            <span class="muted" style="font-size:12px">Active Jobs</span><br />
            <span style="font-weight:600">${enabledCount} / ${this.cronJobs.length}</span>
          </div>
          <div>
            <span class="muted" style="font-size:12px">Next Wake</span><br />
            <span class="mono">${nextWake ? this._formatDate(nextWake.nextRun) : "—"}</span>
          </div>
        </div>
      </div>

      <!-- New Job Form -->
      <div class="card" style="margin-bottom:16px">
        <div class="card-title">Add New Job</div>
        <div class="form-grid" style="margin-top:12px">
          <div class="field">
            <span>Job Name</span>
            <input
              type="text"
              placeholder="my-job"
              .value=${this.newCronName}
              @input=${(e: InputEvent) => {
                this.newCronName = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
          <div class="field">
            <span>Schedule Type</span>
            <select
              .value=${this.newCronScheduleType}
              @change=${(e: Event) => {
                this.newCronScheduleType = (e.target as HTMLSelectElement).value as "every" | "at" | "cron";
              }}
            >
              <option value="every">Every</option>
              <option value="at">At</option>
              <option value="cron">Cron</option>
            </select>
          </div>
          <div class="field">
            <span>Schedule</span>
            <input
              type="text"
              placeholder="${this.newCronScheduleType === "every" ? "24h" : this.newCronScheduleType === "at" ? "Monday 09:00" : "0 */6 * * *"}"
              .value=${this.newCronSchedule}
              @input=${(e: InputEvent) => {
                this.newCronSchedule = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
          <div class="field">
            <span>Payload (JSON)</span>
            <input
              type="text"
              placeholder='{}'
              .value=${this.newCronPayload}
              @input=${(e: InputEvent) => {
                this.newCronPayload = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
        </div>
        <div style="margin-top:12px">
          <button class="btn primary" @click=${() => this._addCronJob()}>Add Job</button>
        </div>
      </div>

      <!-- Job List -->
      <div class="card">
        <div class="card-title" style="margin-bottom:12px">
          Jobs (${this.cronJobs.length})
        </div>
        <div class="list" data-testid="cron-job-list">
          ${this.cronJobs.length === 0
            ? html`<div class="empty-state"><div class="empty-title">No cron jobs</div><p>Add a job above to get started.</p></div>`
            : this.cronJobs.map(
                (job, i) => html`
                  <div class="list-item">
                    <div class="list-main">
                      <div class="list-title">${job.name}</div>
                      <div class="list-sub mono">${job.schedule}</div>
                      <div class="cron-job-footer">
                        <div class="cron-job-chips">
                          <span class="chip ${job.enabled ? "chip-ok" : "chip-danger"}">
                            ${job.enabled ? "Enabled" : "Disabled"}
                          </span>
                          <span class="chip">${job.scheduleType}</span>
                        </div>
                        <div class="cron-job-actions">
                          <button class="btn sm" @click=${() => this._toggleCronJob(i)}>
                            ${job.enabled ? "Disable" : "Enable"}
                          </button>
                          <button class="btn sm primary" @click=${() => this._runCronJob(i)}>
                            Run
                          </button>
                          <button class="btn sm danger" @click=${() => this._removeCronJob(i)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="list-meta">
                      <div>Last: ${job.lastRun === "—" ? "—" : this._formatDate(job.lastRun)}</div>
                      <div>Next: ${this._formatDate(job.nextRun)}</div>
                    </div>
                  </div>
                `
              )}
        </div>
      </div>
    `;
  }

  /* ── Sessions ── */

  private _renderSessions() {
    const filtered = this._filteredSessions;

    return html`
      <div class="page-header">
        <h1 class="page-title">Sessions</h1>
        <p class="page-sub">Active and recent sessions</p>
      </div>

      <!-- Filter bar -->
      <div class="card" style="margin-bottom:16px">
        <div class="row" style="gap:16px;flex-wrap:wrap">
          <div class="field" style="min-width:120px">
            <span>Active Minutes</span>
            <input
              type="number"
              .value=${String(this.sessionActiveMinutes)}
              @input=${(e: InputEvent) => {
                this.sessionActiveMinutes = Number((e.target as HTMLInputElement).value) || 60;
              }}
            />
          </div>
          <div class="field" style="min-width:100px">
            <span>Limit</span>
            <input
              type="number"
              .value=${String(this.sessionLimit)}
              @input=${(e: InputEvent) => {
                this.sessionLimit = Number((e.target as HTMLInputElement).value) || 50;
              }}
            />
          </div>
          <div class="field checkbox">
            <input
              type="checkbox"
              .checked=${this.sessionShowGlobal}
              @change=${(e: Event) => {
                this.sessionShowGlobal = (e.target as HTMLInputElement).checked;
              }}
            />
            <span>Show Global</span>
          </div>
          <div class="field checkbox">
            <input
              type="checkbox"
              .checked=${this.sessionShowUnknown}
              @change=${(e: Event) => {
                this.sessionShowUnknown = (e.target as HTMLInputElement).checked;
              }}
            />
            <span>Show Unknown</span>
          </div>
        </div>
      </div>

      <!-- Sessions Table -->
      <div class="card">
        <table class="data-table" data-testid="sessions-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Label</th>
              <th>Kind</th>
              <th>Updated</th>
              <th>Tokens</th>
              <th>Thinking</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0
              ? html`<tr><td colspan="7" style="text-align:center;padding:24px" class="muted">No sessions match filters</td></tr>`
              : filtered.map(
                  (s) => html`
                    <tr>
                      <td class="mono">${s.key}</td>
                      <td>${s.label}</td>
                      <td><span class="chip">${s.kind}</span></td>
                      <td>${this._formatDate(s.updated)}</td>
                      <td>${s.tokens.toLocaleString()}</td>
                      <td>${s.thinkingLevel}</td>
                      <td>
                        <button
                          class="btn sm danger"
                          @click=${() => this._deleteSession(s.key)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  `
                )}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ── Usage & Costs ── */

  private _renderUsage() {
    const data = this._filteredUsage;
    const totals = this._usageTotals;
    const maxCost = Math.max(...data.map((d) => d.cost), 0.01);

    const totalMessages = 142;
    const avgCostPerMsg = totals.totalCost / Math.max(totalMessages, 1);
    const cacheHitRate = totals.totalTokens > 0
      ? ((totals.totalCacheRead / totals.totalTokens) * 100).toFixed(1)
      : "0.0";
    const pctInput = totals.totalTokens > 0 ? ((totals.totalInput / totals.totalTokens) * 100).toFixed(1) : "0.0";
    const pctOutput = totals.totalTokens > 0 ? ((totals.totalOutput / totals.totalTokens) * 100).toFixed(1) : "0.0";
    const pctCacheRead = cacheHitRate;
    const pctCacheWrite = totals.totalTokens > 0 ? ((totals.totalCacheWrite / totals.totalTokens) * 100).toFixed(1) : "0.0";

    return html`
      <div class="page-header">
        <h1 class="page-title">Usage &amp; Costs</h1>
        <p class="page-sub">Token usage and cost breakdown</p>
      </div>

      <!-- Date range -->
      <div class="card" style="margin-bottom:16px">
        <div class="row" style="gap:12px">
          <div class="field">
            <span>From</span>
            <input
              type="date"
              .value=${this.usageDateFrom}
              @input=${(e: InputEvent) => {
                this.usageDateFrom = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
          <div class="field">
            <span>To</span>
            <input
              type="date"
              .value=${this.usageDateTo}
              @input=${(e: InputEvent) => {
                this.usageDateTo = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
          <div style="align-self:flex-end">
            <span style="font-weight:600;font-size:18px">$${totals.totalCost.toFixed(2)}</span>
            <span class="muted" style="font-size:12px;margin-left:4px">total</span>
          </div>
        </div>
      </div>

      <!-- Bar Chart -->
      <div class="card" style="margin-bottom:16px" data-testid="cost-chart">
        <div class="card-title" style="margin-bottom:12px">Daily Costs</div>
        <div class="bar-chart">
          ${data.map(
            (d) => html`
              <div class="bar-col">
                <div
                  class="bar"
                  style="height:${Math.max((d.cost / maxCost) * 100, 2)}%"
                  title="$${d.cost.toFixed(2)}"
                ></div>
                <span class="bar-label">${this._shortDate(d.date)}</span>
              </div>
            `
          )}
        </div>
      </div>

      <!-- Cost Breakdown -->
      <div class="grid grid-cols-2" style="margin-bottom:16px">
        <div class="card">
          <div class="card-title" style="margin-bottom:12px">Token Breakdown</div>
          <div class="list">
            <div class="list-item">
              <div class="list-main">
                <div class="list-title">Input Tokens</div>
                <div class="list-sub">${totals.totalInput.toLocaleString()} tokens</div>
              </div>
              <div class="list-meta"><span class="chip">${pctInput}%</span></div>
            </div>
            <div class="list-item">
              <div class="list-main">
                <div class="list-title">Output Tokens</div>
                <div class="list-sub">${totals.totalOutput.toLocaleString()} tokens</div>
              </div>
              <div class="list-meta"><span class="chip">${pctOutput}%</span></div>
            </div>
            <div class="list-item">
              <div class="list-main">
                <div class="list-title">Cache Read</div>
                <div class="list-sub">${totals.totalCacheRead.toLocaleString()} tokens</div>
              </div>
              <div class="list-meta"><span class="chip chip-ok">${pctCacheRead}%</span></div>
            </div>
            <div class="list-item">
              <div class="list-main">
                <div class="list-title">Cache Write</div>
                <div class="list-sub">${totals.totalCacheWrite.toLocaleString()} tokens</div>
              </div>
              <div class="list-meta"><span class="chip">${pctCacheWrite}%</span></div>
            </div>
          </div>
        </div>

        <!-- Insights -->
        <div class="card">
          <div class="card-title" style="margin-bottom:12px">Insights</div>
          <div class="list">
            <div class="list-item">
              <span class="muted">Total Messages</span>
              <span style="font-weight:600">${totalMessages}</span>
            </div>
            <div class="list-item">
              <span class="muted">Avg Cost / Message</span>
              <span style="font-weight:600">$${avgCostPerMsg.toFixed(4)}</span>
            </div>
            <div class="list-item">
              <span class="muted">Top Model</span>
              <span class="mono">claude-sonnet-4</span>
            </div>
            <div class="list-item">
              <span class="muted">Top Provider</span>
              <span>Anthropic</span>
            </div>
            <div class="list-item">
              <span class="muted">Cache Hit Rate</span>
              <span class="chip chip-ok">${cacheHitRate}%</span>
            </div>
            <div class="list-item">
              <span class="muted">Error Rate</span>
              <span class="chip chip-ok">0.3%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ── Config ── */

  private _renderConfig() {
    const sectionSettings = this.configSettings.filter(
      (s) => s.section === this.activeConfigSection
    );

    return html`
      <div class="page-header">
        <h1 class="page-title">Configuration</h1>
        <p class="page-sub">Manage OpenClaw settings</p>
      </div>

      <div style="display:flex;gap:16px">
        <!-- Section Sidebar -->
        <div style="min-width:180px">
          <div class="list">
            ${CONFIG_SECTIONS.map(
              (sec) => html`
                <div
                  class="list-item list-item-clickable ${this.activeConfigSection === sec ? "list-item-selected" : ""}"
                  @click=${() => { this.activeConfigSection = sec; }}
                >
                  <span class="list-title">${sec}</span>
                </div>
              `
            )}
          </div>
        </div>

        <!-- Settings Form -->
        <div class="card" style="flex:1" data-testid="config-form">
          <div class="card-title" style="margin-bottom:16px">${this.activeConfigSection} Settings</div>
          <div class="form-grid">
            ${sectionSettings.map(
              (setting) => html`
                <div class="setting-row">
                  <div class="field">
                    <span style="display:flex;align-items:center">
                      ${setting.label}
                      <span class="info-circle" data-testid="info-circle">
                        i
                        <span class="tooltip">${setting.description}</span>
                      </span>
                    </span>
                    ${setting.type === "select"
                      ? html`
                          <select
                            .value=${setting.value}
                            @change=${(e: Event) => {
                              this._updateConfig(setting.key, (e.target as HTMLSelectElement).value);
                            }}
                          >
                            ${(setting.options ?? []).map(
                              (opt) => html`<option value=${opt} ?selected=${opt === setting.value}>${opt}</option>`
                            )}
                          </select>
                        `
                      : setting.type === "toggle"
                        ? html`
                            <select
                              .value=${setting.value}
                              @change=${(e: Event) => {
                                this._updateConfig(setting.key, (e.target as HTMLSelectElement).value);
                              }}
                            >
                              <option value="true" ?selected=${setting.value === "true"}>Enabled</option>
                              <option value="false" ?selected=${setting.value === "false"}>Disabled</option>
                            </select>
                          `
                        : html`
                            <input
                              type=${setting.type === "number" ? "number" : "text"}
                              .value=${setting.value}
                              @input=${(e: InputEvent) => {
                                this._updateConfig(setting.key, (e.target as HTMLInputElement).value);
                              }}
                            />
                          `}
                  </div>
                </div>
              `
            )}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "openclaw-dashboard": OpenClawDashboard;
  }
}
