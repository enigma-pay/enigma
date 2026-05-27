import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { COSSISTANT_LANDING_STYLES } from "./styles";

const NAV_LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/changelog", label: "Changelog" },
];

const FRAMEWORKS = ["React", "Next.js", "Tailwind", "Shadcn/UI"];

const CONVERSATIONS = [
  {
    name: "Sofia",
    message: "How do I connect Cossistant to Stripe?",
    time: "now",
    active: true,
  },
  {
    name: "Marcus",
    message: "The agent asked me to clarify billing.",
    time: "2m",
    active: false,
  },
  {
    name: "Ari",
    message: "Can I install this in a Next.js app?",
    time: "8m",
    active: false,
  },
  {
    name: "Nora",
    message: "Need a hand with the Linear workflow.",
    time: "12m",
    active: false,
  },
];

const BENEFITS = [
  {
    title: "Self-learning knowledge base",
    description:
      "Cossistant crawls your docs, resources and conversations to auto-build FAQs, improving agents answers as your product and support evolves.",
    graphic: "self-learning",
  },
  {
    title: "Default & Custom tools",
    description:
      "Out-of-the-box support for tools like Linear to log tickets, Stripe to check subscriptions, and Cal.com to book calls, plus the freedom to wire up your own APIs for truly custom actions.",
    graphic: "tools",
  },
  {
    title: "Control prompt & skills",
    description:
      "Set the model, prompt, personality and skills of your agent. Make it formal, funny, or straight to the point — you’re in charge.",
    graphic: "prompt",
  },
];

const SELF_LEARNING_CARDS = [
  {
    title: "SSO Configuration",
    description:
      "Configure Single Sign-On with popular identity providers like Google and Microsoft",
    date: "Updated 2 hours ago",
    className: "one",
  },
  {
    title: "API Integration Setup",
    description:
      "Complete tutorial for connecting your app with our REST API and webhooks",
    date: "Updated 1 day ago",
    className: "two",
  },
  {
    title: "How to upgrade my plan?",
    description:
      "Step-by-step guide to upgrade your subscription and access premium features",
    date: "Auto-updated 3 days ago by AI",
    className: "three",
  },
];

const PROMPT_LINES = [
  "You are a friendly and professional support agent for Acme SaaS.",
  "Always maintain a helpful, empathetic tone while being concise.",
  "Prioritize solving customer problems quickly and efficiently.",
  "## Rules",
  "- If you don't know the answer, escalate to human support immediately",
  "- NEVER make up information or provide guesses",
  "- Do not book a time with our founder if the user is not an enterprise customer",
];

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 350 286"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M349.071 60.9512V286H65.5293L.508789 225.719V60.9512L65.5293 0H284.051l65.02 60.9512Zm-267.956 37.33c-3.81 0-7.455 1.557-10.089 4.311l-11.257 11.767c-2.51 2.624-3.899 6.122-3.873 9.752l.183 25.368h24.964l-.224-13.446c0-9.826 2.343-11.681 12.751-11.681h22.849c10.409 0 11.96 1.855 11.96 12.457v12.67h25.218v-25.373c0-3.627-1.412-7.112-3.937-9.717l-11.497-11.863c-2.63-2.713-6.247-4.245-10.026-4.245H81.115Zm125.666 0c-3.81 0-7.455 1.557-10.09 4.311l-11.256 11.767c-2.51 2.624-3.9 6.122-3.873 9.752l.182 25.368h24.965l-.224-13.446c0-9.826 2.343-11.681 12.751-11.681h22.849c10.408 0 11.959 1.855 11.959 12.457v12.67h25.219v-25.373c0-3.627-1.413-7.112-3.938-9.717l-11.497-11.863c-2.63-2.713-6.247-4.245-10.026-4.245h-47.021Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

function LogoText() {
  return (
    <span className="cl-logo-text cl-font-stout">
      <LogoMark className="cl-framework-icon" />
      <span className="cl-logo-word">cossistant</span>
    </span>
  );
}

function FullWidthBorder({ position }: { position: "top" | "bottom" }) {
  return <div className="cl-full-width-border" style={{ [position]: 0 }} />;
}

function ButtonLink({
  children,
  href,
  variant = "primary",
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "ghost";
}) {
  return (
    <Link
      className={`cl-button ${
        variant === "primary" ? "cl-button-primary" : "cl-button-ghost"
      }`}
      href={href}
    >
      {children}
    </Link>
  );
}

function TopBar() {
  return (
    <div className="cl-topbar">
      <div className="cl-topbar-fill" />
      <div className="cl-container-wrapper">
        <div className="cl-container cl-topbar-inner">
          <div className="cl-topbar-logo-wrap">
            <Link aria-label="Cossistant home" href="/">
              <LogoText />
            </Link>
          </div>
          <nav aria-label="Main navigation" className="cl-nav">
            {NAV_LINKS.map((link) => (
              <Link className="cl-nav-link" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="cl-topbar-actions">
            <div className="cl-search">Search docs...</div>
            <Link className="cl-topbar-button" href="/dashboard">
              Dashboard
            </Link>
          </div>
          <FullWidthBorder position="bottom" />
        </div>
      </div>
    </div>
  );
}

function BrowserShell({ children }: { children: ReactNode }) {
  return (
    <div className="fake-browser-wrapper">
      <div className="cl-browser-shell">
        <div className="cl-browser-chrome">
          <div className="cl-traffic">
            <span className="cl-dot cl-dot-red" />
            <span className="cl-dot cl-dot-yellow" />
            <span className="cl-dot cl-dot-green" />
          </div>
          <div className="cl-url">https://cossistant.com/shadcn/inbox</div>
          <div className="cl-traffic" />
        </div>
        {children}
      </div>
    </div>
  );
}

function FakeDashboard() {
  return (
    <div className="fake-dashboard-container">
      <div className="cl-fake-dashboard">
        <header className="cl-fake-nav">
          <div className="cl-fake-nav-left">
            <LogoMark className="cl-framework-icon" />
          </div>
          <div className="cl-fake-nav-right">
            <span className="cl-fake-nav-pill">Agent</span>
            <span className="cl-fake-nav-pill">Contacts</span>
            <span className="cl-fake-nav-pill cl-fake-help">Need help?</span>
          </div>
        </header>
        <div className="fake-central-container">
          <section className="cl-fake-central-shell">
            <aside className="cl-fake-sidebar">
              <div className="cl-fake-team">
                <LogoMark className="cl-framework-icon" />
                <span>cossistant</span>
              </div>
              <div className="cl-fake-search">Search conversations</div>
              <div className="cl-fake-menu">
                <div className="cl-fake-menu-item is-active">
                  <span>Inbox</span>
                  <span>12</span>
                </div>
                <div className="cl-fake-menu-item">
                  <span>Agent training</span>
                  <span>4</span>
                </div>
                <div className="cl-fake-menu-item">
                  <span>Tools</span>
                  <span>9</span>
                </div>
                <div className="cl-fake-menu-item">
                  <span>Knowledge</span>
                  <span>28</span>
                </div>
              </div>
            </aside>

            <section className="cl-fake-inbox">
              <div className="cl-fake-pane-head">
                <h3>Inbox</h3>
                <p>AI triages, asks, and learns from your team.</p>
              </div>
              <div className="cl-fake-conversation-list">
                {CONVERSATIONS.map((conversation) => (
                  <div
                    className={`cl-fake-conversation-card ${
                      conversation.active ? "is-active" : ""
                    }`}
                    key={conversation.name}
                  >
                    <div className="cl-fake-card-top">
                      <span className="cl-fake-card-title">
                        {conversation.name}
                      </span>
                      <span className="cl-fake-card-time">
                        {conversation.time}
                      </span>
                    </div>
                    <div className="cl-fake-card-message">
                      {conversation.message}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="cl-fake-chat">
              <div className="cl-fake-pane-head">
                <h3>Support conversation</h3>
                <p>AI agent drafts an answer and escalates when needed.</p>
              </div>
              <div className="cl-fake-chat-body">
                <div className="cl-fake-message visitor">
                  Can Cossistant create a ticket in Linear if the AI cannot solve
                  a customer issue?
                </div>
                <div className="cl-fake-message agent">
                  Yes. Cossistant can use tools like Linear, Stripe, and Cal.com,
                  and you can wire up your own APIs for custom actions.
                </div>
                <div className="cl-fake-message note">
                  When the AI agent doesn&apos;t know, it asks you for
                  clarification. You answer once, and the AI agent uses that
                  answer next time.
                </div>
              </div>
              <div className="cl-fake-composer">
                <div className="cl-fake-input">
                  Ask the AI agent to draft a response...
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
}

function BrowserShowcase() {
  return (
    <div className="cl-browser-section">
      <FullWidthBorder position="top" />
      <div className="cl-browser-stage">
        <div className="cl-browser-content">
          <BrowserShell>
            <FakeDashboard />
          </BrowserShell>
        </div>
      </div>
      <FullWidthBorder position="bottom" />
    </div>
  );
}

function Hero() {
  return (
    <section className="cl-hero">
      <div className="cl-hero-copy">
        <p className="cl-eyebrow">
          [AI agent team member that learns from you, not a chatbot]
        </p>
        <h1 className="cl-font-stout cl-hero-title">
          AI Agent Customer Support for Your SaaS in Under 10 Lines of Code
        </h1>
        <div className="cl-hero-actions">
          <ButtonLink href="/sign-up">Install Cossistant now</ButtonLink>
          <ButtonLink href="/docs" variant="ghost">
            Explore the docs
          </ButtonLink>
        </div>
      </div>
      <BrowserShowcase />
      <div className="cl-hero-meta">
        <div className="cl-frameworks">
          <p className="cl-framework-label">Works well with</p>
          {FRAMEWORKS.map((framework) => (
            <span className="cl-framework-chip" key={framework}>
              <span className="cl-framework-icon">
                <LogoMark />
              </span>
              {framework}
            </span>
          ))}
        </div>
        <div className="cl-animation-controls">
          <span className="cl-animation-dot" />
          <span className="cl-animation-label">animation controls</span>
        </div>
      </div>
    </section>
  );
}

function CossistantIs() {
  return (
    <section className="cl-narrative">
      <h2 className="cl-font-stout">
        <strong>
          Support isn&apos;t just about answering questions. It&apos;s about
          keeping users{" "}
          <span className="cl-inline-logo">
            <LogoMark className="cl-framework-icon" />
          </span>{" "}
          moving.
        </strong>
        <br />
        <br />
        Cossistant answers the common questions, covers your team when you
        can&apos;t, and learns from the people who know your product best:{" "}
        <strong>you.</strong>
        <br />
        <br />
        Every answer you add makes it better.{" "}
        <strong>Every fix you make makes the next conversation easier.</strong>
        <br />
        <br />
        <strong>
          Built for React{" "}
          <span className="cl-inline-logo">
            <LogoMark className="cl-framework-icon" />
          </span>{" "}
          and Next.js{" "}
          <span className="cl-inline-logo">
            <LogoMark className="cl-framework-icon" />
          </span>
        </strong>
        , so it feels like part of your product not someone else&apos;s.
      </h2>
    </section>
  );
}

function PrecisionFlowSection() {
  return (
    <section className="cl-precision">
      <FullWidthBorder position="top" />
      <div className="cl-precision-inner">
        <div className="cl-precision-copy">
          <div>
            <p className="cl-eyebrow">[How it learns]</p>
            <h2 className="cl-font-stout cl-section-title">
              When the AI agent doesn&apos;t know,
              <br />
              it asks you for clarification.
            </h2>
            <p className="cl-section-copy">
              You answer once, and the AI agent uses that answer next time.
            </p>
          </div>
          <div className="cl-control-row">
            {["Replay", "Clarify", "Approve"].map((item) => (
              <span className="cl-control-chip" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="cl-precision-stage">
          <div className="cl-flow-stack">
            <div className="cl-flow-card">
              <p className="cl-flow-label">Visitor asks</p>
              <p>Can I connect this to my billing system?</p>
            </div>
            <div className="cl-flow-card">
              <p className="cl-flow-label">AI needs clarification</p>
              <p>Should I mention Stripe plans or only subscription status?</p>
            </div>
            <div className="cl-flow-card">
              <p className="cl-flow-label">You answer once</p>
              <p>Mention plan, renewal date, and payment status.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SelfLearningGraphic() {
  return (
    <div className="cl-self-learning-graphic">
      {SELF_LEARNING_CARDS.map((card) => (
        <div
          className={`cl-knowledge-card ${card.className}`}
          key={card.title}
        >
          <div>
            <p>{card.title}</p>
          </div>
          <p>{card.description}</p>
          <p>{card.date}</p>
        </div>
      ))}
    </div>
  );
}

function CustomToolsGraphic() {
  return (
    <div className="cl-tools-graphic">
      <svg
        aria-hidden="true"
        className="cl-tools-beams"
        fill="none"
        viewBox="0 0 520 260"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M70 40H190V130H260" />
        <path d="M70 130H260" />
        <path d="M70 220H190V130H260" />
        <path d="M450 40H330V130H260" />
        <path d="M450 130H260" />
        <path d="M450 220H330V130H260" />
        <path className="cl-beam-flow reverse" d="M70 40H190V130H260" />
        <path className="cl-beam-flow" d="M450 130H260" />
        <path className="cl-beam-flow slow" d="M70 220H190V130H260" />
      </svg>
      <div className="cl-tool-node top-left">LINEAR</div>
      <div className="cl-tool-node mid-left">CAL</div>
      <div className="cl-tool-node bottom-left">STRIPE</div>
      <div className="cl-tool-node top-right">API</div>
      <div className="cl-tool-node mid-right">
        <span>+</span>
        <span>+</span>
        <span>0</span>
      </div>
      <div className="cl-tool-node bottom-right">WEB HOOK</div>
      <div className="cl-tool-core">
        <LogoMark />
      </div>
    </div>
  );
}

function PromptToneGraphic() {
  return (
    <div className="cl-prompt-graphic">
      {PROMPT_LINES.map((line, index) => (
        <p
          className={index >= 4 ? "cl-prompt-muted" : undefined}
          key={line}
          style={{ animationDelay: `${index * 90}ms` }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function BenefitGraphic({ type }: { type: string }) {
  if (type === "self-learning") {
    return <SelfLearningGraphic />;
  }

  if (type === "tools") {
    return <CustomToolsGraphic />;
  }

  return <PromptToneGraphic />;
}

function Benefits() {
  return (
    <section className="cl-benefits">
      <FullWidthBorder position="top" />
      <div className="cl-benefits-head">
        <p className="cl-eyebrow">
          [Support your customers faster with your own AI agent]
        </p>
        <h2 className="cl-font-stout cl-section-title">
          Wake up to zero support tickets, your custom
          <br />
          AI agent keeps your users happy while you sleep.
        </h2>
      </div>
      <div className="cl-benefits-grid">
        <FullWidthBorder position="top" />
        {BENEFITS.map((benefit) => (
          <article className="cl-benefit" key={benefit.title}>
            <div className="cl-benefit-graphic">
              <BenefitGraphic type={benefit.graphic} />
            </div>
            <h3>{benefit.title}</h3>
            <p>{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function InstallSection() {
  return (
    <section className="cl-install">
      <FullWidthBorder position="top" />
      <div className="cl-install-inner">
        <div className="cl-install-preview">
          <div className="cl-component-preview">
            <div className="cl-preview-tabs">
              <span>[ Preview ]</span>
              <span>Code</span>
            </div>
            <div className="cl-preview-frame">
              <div className="cl-support-card">
                <div className="cl-support-header">
                  <button aria-label="Go back" type="button">
                    ‹
                  </button>
                  <div>
                    <p>Cossistant</p>
                    <span>Support online</span>
                  </div>
                  <Image
                    alt="Cossistant agent avatar"
                    className="cl-agent-avatar"
                    height={40}
                    src="/cossistant/anthony-picture.jpg"
                    width={40}
                  />
                  <button aria-label="Close" type="button">
                    ×
                  </button>
                </div>
                <div className="cl-support-body">
                  <div className="cl-support-message visitor">
                    Hey, on the Cinematic preset your generator keeps cropping my
                    face out of the thumbnail.
                  </div>
                  <div className="cl-support-time">01:05 AM</div>
                  <div className="cl-support-author">Cossistant AI</div>
                  <div className="cl-support-message agent">
                    I can help. Try switching face-safe framing on, or upload a
                    reference crop so the agent protects the subject.
                  </div>
                </div>
              </div>
              <pre className="cl-preview-code" aria-hidden="true">
{`> i]]I:.^
> i]]I:"^
<< >i]I:
~ <>i]I ,
~~ <i]I:^`}
              </pre>
            </div>
          </div>
        </div>
        <div className="cl-install-copy">
          <p className="cl-eyebrow">[For React + Next.js]</p>
          <h2 className="cl-font-stout cl-section-title">
            Add a support AI agent to your app in one command.
          </h2>
          <p className="cl-section-copy">
            Not a separate tool. Not a generic widget. Support AI agent that
            lives in your product and learns how your team works.
          </p>
          <div className="cl-command-tabs">
            <div className="cl-tabs">
              <span>[npm]</span>
              <span>pnpm</span>
              <span>bun</span>
              <span>yarn</span>
            </div>
            <code className="cl-command">$ npm install @cossistant/react</code>
          </div>
          <div className="cl-install-actions">
            <ButtonLink href="/sign-up">Install Cossistant</ButtonLink>
            <ButtonLink href="/docs" variant="ghost">
              Read the docs
            </ButtonLink>
          </div>
        </div>
      </div>
      <FullWidthBorder position="bottom" />
    </section>
  );
}

function Footer() {
  return (
    <footer className="cl-footer">
      <div className="cl-container-wrapper cl-footer-main">
        <div className="cl-container cl-footer-grid">
          <div className="cl-footer-brand">
            <LogoMark className="cl-framework-icon" />
            <p className="cl-footer-copy">
              the open-source, ai-native support infrastructure for modern saas.
              built for developers, designed for your customers.
            </p>
            <a
              className="cl-github-link"
              href="https://github.com/cossistantcom/cossistant"
              rel="noopener noreferrer"
              target="_blank"
            >
              Star us on GitHub
            </a>
          </div>
          <div>
            <h3>Links</h3>
            <ul>
              <li>
                <Link href="/docs">Docs</Link>
              </li>
              <li>
                <Link href="/open-source-program">Open Source Program</Link>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
              <li>
                <Link href="/changelog">Changelog</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>Community</h3>
            <ul>
              <li>
                <a
                  href="https://discord.gg/cossistant"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/cossistant"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  X
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="cl-footer-bottom">
        <div className="cl-background-grid" />
        <div className="cl-container-wrapper cl-footer-bottom-row">
          <p>© 2025 cossistant. open source under GPL-3.0 license.</p>
          <div className="cl-footer-bottom-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a
              href="https://github.com/cossistantcom/cossistant?tab=security-ov-file#readme"
              rel="noopener noreferrer"
              target="_blank"
            >
              Security
            </a>
          </div>
        </div>
        <div className="cl-font-stout cl-footer-watermark">cossistant</div>
      </div>
    </footer>
  );
}

export function CossistantLanding() {
  return (
    <div className="cossistant-landing">
      <style>{COSSISTANT_LANDING_STYLES}</style>
      <TopBar />
      <main className="cl-main">
        <div className="cl-container-wrapper">
          <Hero />
          <CossistantIs />
          <PrecisionFlowSection />
          <Benefits />
          <InstallSection />
        </div>
      </main>
      <Footer />
    </div>
  );
}
