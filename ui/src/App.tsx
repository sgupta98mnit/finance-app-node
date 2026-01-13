import { useMemo, useState } from 'react';

type NavKey =
  | 'overview'
  | 'transfers'
  | 'accounts'
  | 'ledger'
  | 'services'
  | 'observability'
  | 'settings';

type PulseCard = {
  label: string;
  value: string;
  delta: string;
  tone: 'good' | 'warn' | 'bad' | 'info';
};

type TransferFlow = {
  id: string;
  amount: string;
  currency: string;
  from: string;
  to: string;
  status: 'In Review' | 'Settling' | 'Completed' | 'Failed';
  step: number;
};

type ServiceNode = {
  name: string;
  latency: string;
  status: 'Healthy' | 'Degraded' | 'Down';
  events: string[];
};

const navItems: { key: NavKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'transfers', label: 'Transfers' },
  { key: 'accounts', label: 'Accounts' },
  { key: 'ledger', label: 'Ledger' },
  { key: 'services', label: 'Services' },
  { key: 'observability', label: 'Observability' },
  { key: 'settings', label: 'Settings' }
];

const pulseCards: PulseCard[] = [
  { label: 'Active Transfers', value: '24', delta: '+4.8% vs 1h', tone: 'info' },
  { label: 'Failed Transfers (15m)', value: '2', delta: '+1 new', tone: 'bad' },
  { label: 'Kafka Lag', value: '0.8s', delta: 'Stable', tone: 'good' },
  { label: 'Ledger Writes/sec', value: '143', delta: '+12%', tone: 'good' },
  { label: 'Fraud Rejections Today', value: '5', delta: '0 new', tone: 'warn' }
];

const transferJourney = [
  'transfer.requested.v1',
  'transfer.fraud_checked.v1',
  'transfer.ledger_recorded.v1',
  'transfer.completed.v1',
  'notification.requested.v1'
];

const liveTransfers: TransferFlow[] = [
  {
    id: 'trf_8T9A',
    amount: '1,240.00',
    currency: 'USD',
    from: 'checking_302',
    to: 'savings_118',
    status: 'Settling',
    step: 3
  },
  {
    id: 'trf_9QB7',
    amount: '250.00',
    currency: 'USD',
    from: 'checking_091',
    to: 'vendor_552',
    status: 'In Review',
    step: 2
  },
  {
    id: 'trf_1LA4',
    amount: '14,000.00',
    currency: 'USD',
    from: 'treasury_001',
    to: 'custody_044',
    status: 'Failed',
    step: 2
  }
];

const services: ServiceNode[] = [
  {
    name: 'gateway',
    latency: '42ms',
    status: 'Healthy',
    events: ['auth.login', 'transfer.requested.v1']
  },
  {
    name: 'auth-service',
    latency: '58ms',
    status: 'Healthy',
    events: ['user.created.v1']
  },
  {
    name: 'account-service',
    latency: '76ms',
    status: 'Degraded',
    events: ['account.created.v1']
  },
  {
    name: 'transaction-service',
    latency: '88ms',
    status: 'Healthy',
    events: ['transfer.requested.v1']
  },
  {
    name: 'ledger-service',
    latency: '64ms',
    status: 'Healthy',
    events: ['transfer.ledger_recorded.v1']
  },
  {
    name: 'fraud-service',
    latency: '92ms',
    status: 'Healthy',
    events: ['transfer.fraud_checked.v1']
  },
  {
    name: 'notification-service',
    latency: '40ms',
    status: 'Healthy',
    events: ['notification.requested.v1']
  }
];

const observabilityLinks = [
  { label: 'Prometheus', url: 'http://localhost:9090' },
  { label: 'Grafana', url: 'http://localhost:3007' },
  { label: 'Swagger Gateway', url: 'http://localhost:3008/docs' },
  { label: 'OTel Collector', url: 'http://localhost:4318' }
];

export default function App() {
  const [active, setActive] = useState<NavKey>('overview');
  const now = useMemo(() => new Date().toLocaleString(), []);
  const [baseUrl, setBaseUrl] = useState(
    () => localStorage.getItem('fintech.baseUrl') || 'http://localhost:3008'
  );
  const [token, setToken] = useState(() => localStorage.getItem('fintech.token') || '');
  const [status, setStatus] = useState<string>('Idle');
  const [result, setResult] = useState<unknown>(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [accountForm, setAccountForm] = useState({
    userId: 'user-1',
    type: 'CHECKING',
    currency: 'USD'
  });
  const [transferForm, setTransferForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '10',
    currency: 'USD',
    idempotencyKey: `ui-${Date.now()}`
  });
  const [ledgerLookup, setLedgerLookup] = useState({ accountId: '', limit: '10' });

  const updateBaseUrl = (value: string) => {
    setBaseUrl(value);
    localStorage.setItem('fintech.baseUrl', value);
  };

  const persistToken = (value: string) => {
    setToken(value);
    localStorage.setItem('fintech.token', value);
  };

  const apiRequest = async (path: string, options: RequestInit = {}) => {
    setStatus('Working...');
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      if (!response.ok) {
        throw new Error(data?.message || `Request failed (${response.status})`);
      }
      setStatus('Success');
      setResult(data);
      return data;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Request failed');
      setResult(null);
      throw error;
    }
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span>FinCore</span>
          <small>Command Plane</small>
        </div>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${active === item.key ? 'nav-item--active' : ''}`}
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar__footer">
          <span>Environment</span>
          <strong>local</strong>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar__left">
            <span className="eyebrow">FinTech Microservices Control Plane</span>
            <h1>{navItems.find((item) => item.key === active)?.label}</h1>
          </div>
          <div className="topbar__right">
            <div className="status-chip">Kafka: Healthy</div>
            <div className="status-chip">P95: 120ms</div>
            <div className="status-chip">Incidents: 1</div>
            <div className="live-indicator">Live · {now}</div>
          </div>
        </header>

        <div className="canvas">
          {active === 'overview' && (
            <div className="page">
              <section className="pulse">
                {pulseCards.map((card) => (
                  <button key={card.label} className={`pulse-card pulse-card--${card.tone}`}>
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                    <small>{card.delta}</small>
                  </button>
                ))}
              </section>

              <section className="journey">
                <div className="section-head">
                  <h2>Transfer Journey</h2>
                  <p>Live event stream across the core money movement pipeline.</p>
                </div>
                <div className="journey__flow">
                  {transferJourney.map((step, index) => (
                    <div key={step} className={`journey__node ${index < 3 ? 'journey__node--active' : ''}`}>
                      <span>{step}</span>
                      <div className="journey__dot" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid-two">
                <div className="panel">
                  <div className="section-head">
                    <h3>Live Transfers</h3>
                    <p>Track money movement with risk and settlement context.</p>
                  </div>
                  <div className="transfer-list">
                    {liveTransfers.map((transfer) => (
                      <article key={transfer.id} className="transfer-card">
                        <div>
                          <span className="transfer-id">{transfer.id}</span>
                          <p>
                            {transfer.from} → {transfer.to}
                          </p>
                        </div>
                        <div>
                          <strong>
                            {transfer.currency} {transfer.amount}
                          </strong>
                          <span className={`transfer-status transfer-status--${transfer.status.replace(' ', '').toLowerCase()}`}>
                            {transfer.status}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="panel panel--secondary">
                  <div className="section-head">
                    <h3>Runbook Actions</h3>
                    <p>Quick actions close to incidents.</p>
                  </div>
                  <div className="action-list">
                    <button className="action">Reprocess failed transfer</button>
                    <button className="action">Throttle gateway</button>
                    <button className="action">Pause fraud checks</button>
                    <button className="action">Trigger ledger reconcile</button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {active === 'transfers' && (
            <div className="page">
              <section className="grid-two">
                <div className="panel">
                  <div className="section-head">
                    <h2>Transfer Studio</h2>
                    <p>Create transfers with idempotency and inspect flow state.</p>
                  </div>
                  <div className="form-grid">
                    <label>
                      From Account
                      <input
                        value={transferForm.fromAccountId}
                        onChange={(event) =>
                          setTransferForm({ ...transferForm, fromAccountId: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      To Account
                      <input
                        value={transferForm.toAccountId}
                        onChange={(event) =>
                          setTransferForm({ ...transferForm, toAccountId: event.target.value })
                        }
                      />
                    </label>
                    <div className="inline">
                      <label>
                        Amount
                        <input
                          value={transferForm.amount}
                          onChange={(event) => setTransferForm({ ...transferForm, amount: event.target.value })}
                        />
                      </label>
                      <label>
                        Currency
                        <input
                          value={transferForm.currency}
                          onChange={(event) => setTransferForm({ ...transferForm, currency: event.target.value })}
                        />
                      </label>
                    </div>
                    <label>
                      Idempotency Key
                      <input
                        value={transferForm.idempotencyKey}
                        onChange={(event) =>
                          setTransferForm({ ...transferForm, idempotencyKey: event.target.value })
                        }
                      />
                    </label>
                    <button
                      className="btn btn--primary"
                      onClick={() =>
                        apiRequest('/transfers', {
                          method: 'POST',
                          headers: { 'Idempotency-Key': transferForm.idempotencyKey },
                          body: JSON.stringify({
                            fromAccountId: transferForm.fromAccountId,
                            toAccountId: transferForm.toAccountId,
                            amount: transferForm.amount,
                            currency: transferForm.currency
                          })
                        })
                      }
                    >
                      Initiate Transfer
                    </button>
                  </div>
                </div>
                <div className="panel panel--secondary">
                  <div className="section-head">
                    <h3>Recent Transfer Signals</h3>
                    <p>Latency, retry, and fraud checkpoints.</p>
                  </div>
                  <div className="signal-list">
                    <div>
                      <strong>fraud-service</strong>
                      <span>2.1s risk review · approved</span>
                    </div>
                    <div>
                      <strong>ledger-service</strong>
                      <span>entry persisted · write lag 80ms</span>
                    </div>
                    <div>
                      <strong>notification-service</strong>
                      <span>email queued · provider OK</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {active === 'accounts' && (
            <div className="page">
              <section className="grid-two">
                <div className="panel">
                  <div className="section-head">
                    <h2>Account Workspace</h2>
                    <p>Create accounts and monitor balance state.</p>
                  </div>
                  <div className="form-grid">
                    <label>
                      User ID
                      <input
                        value={accountForm.userId}
                        onChange={(event) => setAccountForm({ ...accountForm, userId: event.target.value })}
                      />
                    </label>
                    <div className="inline">
                      <label>
                        Type
                        <select
                          value={accountForm.type}
                          onChange={(event) => setAccountForm({ ...accountForm, type: event.target.value })}
                        >
                          <option value="CHECKING">CHECKING</option>
                          <option value="SAVINGS">SAVINGS</option>
                        </select>
                      </label>
                      <label>
                        Currency
                        <input
                          value={accountForm.currency}
                          onChange={(event) => setAccountForm({ ...accountForm, currency: event.target.value })}
                        />
                      </label>
                    </div>
                    <button
                      className="btn btn--primary"
                      onClick={() => apiRequest('/accounts', { method: 'POST', body: JSON.stringify(accountForm) })}
                    >
                      Create Account
                    </button>
                  </div>
                </div>
                <div className="panel panel--secondary">
                  <div className="section-head">
                    <h3>Account Signals</h3>
                    <p>Balance drift and status changes.</p>
                  </div>
                  <div className="signal-list">
                    <div>
                      <strong>checking_302</strong>
                      <span>balance sync OK · ledger drift 0.02%</span>
                    </div>
                    <div>
                      <strong>savings_118</strong>
                      <span>no anomalies · last update 2m</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {active === 'ledger' && (
            <div className="page">
              <section className="grid-two">
                <div className="panel">
                  <div className="section-head">
                    <h2>Ledger Inspection</h2>
                    <p>Query immutable entries and verify double-entry parity.</p>
                  </div>
                  <div className="form-grid">
                    <label>
                      Account ID
                      <input
                        value={ledgerLookup.accountId}
                        onChange={(event) => setLedgerLookup({ ...ledgerLookup, accountId: event.target.value })}
                      />
                    </label>
                    <label>
                      Limit
                      <input
                        value={ledgerLookup.limit}
                        onChange={(event) => setLedgerLookup({ ...ledgerLookup, limit: event.target.value })}
                      />
                    </label>
                    <button
                      className="btn btn--primary"
                      onClick={() =>
                        apiRequest(`/ledger/accounts/${ledgerLookup.accountId}/entries?limit=${ledgerLookup.limit}`)
                      }
                    >
                      Fetch Ledger Entries
                    </button>
                  </div>
                </div>
                <div className="panel panel--secondary">
                  <div className="section-head">
                    <h3>Ledger Health</h3>
                    <p>Write throughput and parity checks.</p>
                  </div>
                  <div className="signal-list">
                    <div>
                      <strong>Writes/sec</strong>
                      <span>143 · consistent</span>
                    </div>
                    <div>
                      <strong>Parity Check</strong>
                      <span>balanced · last run 1m</span>
                    </div>
                    <div>
                      <strong>Outbox lag</strong>
                      <span>0.4s</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {active === 'services' && (
            <div className="page">
              <section className="section-head">
                <h2>Service Graph</h2>
                <p>Health, latency, and dominant event streams.</p>
              </section>
              <div className="service-grid">
                {services.map((service) => (
                  <article key={service.name} className="service-card">
                    <div>
                      <span className={`service-status service-status--${service.status.toLowerCase()}`}>
                        {service.status}
                      </span>
                      <h3>{service.name}</h3>
                      <p>p95 latency {service.latency}</p>
                    </div>
                    <div className="service-events">
                      {service.events.map((event) => (
                        <span key={event}>{event}</span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {active === 'observability' && (
            <div className="page">
              <section className="section-head">
                <h2>Observability Deck</h2>
                <p>Jump into metrics, traces, and dashboards.</p>
              </section>
              <div className="observability">
                {observabilityLinks.map((item) => (
                  <a key={item.label} href={item.url} target="_blank" rel="noreferrer" className="obs-card">
                    <span>{item.label}</span>
                    <span className="obs-card__url">{item.url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {active === 'settings' && (
            <div className="page">
              <section className="grid-two">
                <div className="panel">
                  <div className="section-head">
                    <h2>Workspace Settings</h2>
                    <p>Configure gateway access and credentials.</p>
                  </div>
                  <div className="form-grid">
                    <label>
                      Gateway Base URL
                      <input value={baseUrl} onChange={(event) => updateBaseUrl(event.target.value)} />
                    </label>
                    <label>
                      Email
                      <input
                        value={authForm.email}
                        onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                      />
                    </label>
                    <label>
                      Password
                      <input
                        type="password"
                        value={authForm.password}
                        onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                      />
                    </label>
                    <div className="button-row">
                      <button
                        className="btn btn--ghost"
                        onClick={() =>
                          apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(authForm) })
                        }
                      >
                        Register
                      </button>
                      <button
                        className="btn btn--primary"
                        onClick={async () => {
                          const data = await apiRequest('/auth/login', {
                            method: 'POST',
                            body: JSON.stringify(authForm)
                          });
                          if (data?.accessToken) {
                            persistToken(data.accessToken);
                          }
                        }}
                      >
                        Login
                      </button>
                    </div>
                    <div className="token-row">
                      <span>Access Token</span>
                      <code>{token ? `${token.slice(0, 24)}...` : 'not set'}</code>
                      <button className="btn btn--copy" onClick={() => persistToken('')}>
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
                <div className="panel panel--secondary">
                  <div className="section-head">
                    <h3>Last Response</h3>
                    <p>{status}</p>
                  </div>
                  <pre>{result ? JSON.stringify(result, null, 2) : 'Run a request to see output.'}</pre>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
