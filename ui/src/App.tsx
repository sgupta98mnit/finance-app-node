import { useMemo, useState } from 'react';

type Service = {
  name: string;
  port: number;
  description: string;
  tag: string;
  color: string;
};

type QuickCommand = {
  label: string;
  command: string;
};

const services: Service[] = [
  {
    name: 'Gateway',
    port: 3000,
    description: 'Single entrypoint, auth guards, and routing.',
    tag: 'Edge',
    color: 'citrine'
  },
  {
    name: 'Auth Service',
    port: 3001,
    description: 'JWT, refresh tokens, RBAC, and rate limits.',
    tag: 'Identity',
    color: 'ember'
  },
  {
    name: 'Account Service',
    port: 3002,
    description: 'Accounts, balances, and account.created events.',
    tag: 'Core',
    color: 'reef'
  },
  {
    name: 'Ledger Service',
    port: 3003,
    description: 'Immutable, double-entry ledger API.',
    tag: 'Ledger',
    color: 'ink'
  },
  {
    name: 'Transaction Service',
    port: 3004,
    description: 'Transfers, saga orchestration, outbox.',
    tag: 'Flow',
    color: 'aurora'
  },
  {
    name: 'Fraud Service',
    port: 3005,
    description: 'Rules engine, velocity checks, approvals.',
    tag: 'Risk',
    color: 'rose'
  },
  {
    name: 'Notification Service',
    port: 3006,
    description: 'Mock email + event driven delivery logs.',
    tag: 'Comms',
    color: 'sun'
  }
];

const quickCommands: QuickCommand[] = [
  {
    label: 'Run Demo Script',
    command: 'bash scripts/demo.sh'
  },
  {
    label: 'Smoke Test',
    command: 'bash tests/integration/smoke.sh'
  },
  {
    label: 'Transfer Flow Test',
    command: 'bash tests/integration/transfer-flow.sh'
  }
];

const journey = [
  'transfer.requested.v1',
  'transfer.fraud_checked.v1',
  'transfer.ledger_recorded.v1',
  'transfer.completed.v1',
  'notification.requested.v1'
];

const observability = [
  { label: 'Prometheus', url: 'http://localhost:9090' },
  { label: 'Grafana', url: 'http://localhost:3007' },
  { label: 'Swagger Gateway', url: 'http://localhost:3000/docs' },
  { label: 'OTel Collector', url: 'http://localhost:4318' }
];

export default function App() {
  const [copied, setCopied] = useState<string | null>(null);
  const now = useMemo(() => new Date().toLocaleString(), []);

  const handleCopy = async (command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(command);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__glow" />
        <nav className="nav">
          <span className="brand">FinCore</span>
          <div className="nav__meta">
            <span className="pill">env: local</span>
            <span className="pill">updated: {now}</span>
          </div>
        </nav>

        <div className="hero__body">
          <div className="hero__text">
            <p className="eyebrow">FinTech Microservices Control Room</p>
            <h1>Orchestrate money movement with clarity, speed, and signal.</h1>
            <p className="lead">
              A bold operational cockpit for your NestJS event-driven platform: identity, accounts,
              transfers, ledger integrity, fraud intelligence, and real-time notifications.
            </p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="http://localhost:3000/docs" target="_blank" rel="noreferrer">
                Open API Gateway Docs
              </a>
              <a className="btn btn--ghost" href="http://localhost:3007" target="_blank" rel="noreferrer">
                Launch Grafana
              </a>
            </div>
          </div>

          <div className="hero__panel">
            <div className="panel">
              <div className="panel__header">
                <span>System Pulse</span>
                <span className="status">Live</span>
              </div>
              <div className="panel__metrics">
                <div>
                  <p className="metric__label">Services</p>
                  <p className="metric__value">7</p>
                </div>
                <div>
                  <p className="metric__label">Kafka Topics</p>
                  <p className="metric__value">8</p>
                </div>
                <div>
                  <p className="metric__label">Postgres DBs</p>
                  <p className="metric__value">6</p>
                </div>
                <div>
                  <p className="metric__label">P95 Latency</p>
                  <p className="metric__value">120ms</p>
                </div>
              </div>
              <div className="panel__chart">
                <div className="spark" />
                <div className="spark spark--alt" />
              </div>
            </div>
            <div className="panel panel--secondary">
              <h3>Transfer Journey</h3>
              <ol className="timeline">
                {journey.map((step, index) => (
                  <li key={step} style={{ animationDelay: `${index * 120}ms` }}>
                    <span className="dot" />
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="section">
          <div className="section__title">
            <h2>Service Mesh</h2>
            <p>Every node wired for observability, idempotency, and event-driven flow.</p>
          </div>
          <div className="grid">
            {services.map((service) => (
              <article key={service.name} className={`card card--${service.color}`}>
                <div className="card__top">
                  <div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                  </div>
                  <span className="tag">{service.tag}</span>
                </div>
                <div className="card__bottom">
                  <span>Port</span>
                  <strong>{service.port}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section split">
          <div className="section__title">
            <h2>Quick Commands</h2>
            <p>Run a demo flow, smoke tests, or validate transfer orchestration.</p>
          </div>
          <div className="commands">
            {quickCommands.map((item, index) => (
              <div key={item.label} className="command" style={{ animationDelay: `${index * 80}ms` }}>
                <div>
                  <span className="command__label">{item.label}</span>
                  <code>{item.command}</code>
                </div>
                <button className="btn btn--copy" onClick={() => handleCopy(item.command)}>
                  {copied === item.command ? 'Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
          <div className="section__title">
            <h2>Observability Deck</h2>
            <p>Metrics, traces, and dashboards anchored to your local stack.</p>
          </div>
          <div className="observability">
            {observability.map((item) => (
              <a key={item.label} href={item.url} target="_blank" rel="noreferrer" className="obs-card">
                <span>{item.label}</span>
                <span className="obs-card__url">{item.url}</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>FinCore UI · Event-driven banking stack · Built for clarity and control.</p>
      </footer>
    </div>
  );
}
