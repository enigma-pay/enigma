export const COSSISTANT_LANDING_STYLES = `
@font-face {
  font-family: "F37Stout";
  src:
    url("/cossistant/fonts/F37Stout-Regular.woff2") format("woff2"),
    url("/cossistant/fonts/F37Stout-Regular.woff") format("woff");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

.cossistant-landing {
  --cl-background: oklch(14.5% 0 0);
  --cl-background-50: oklch(15.5% 0 0);
  --cl-background-100: oklch(16.5% 0 0);
  --cl-background-200: oklch(18.5% 0 0);
  --cl-background-300: oklch(20.5% 0 0);
  --cl-background-400: oklch(23.5% 0 0);
  --cl-background-500: oklch(27.5% 0 0);
  --cl-background-700: oklch(34.5% 0 0);
  --cl-foreground: oklch(98.5% 0 0);
  --cl-primary: oklch(98.5% 0 0);
  --cl-primary-foreground: oklch(20.5% 0 0);
  --cl-muted: oklch(70.8% 0 0);
  --cl-border: oklch(26.9% 0 0);
  --cl-orange: hsla(19, 99%, 50%, 1);
  --cl-green: hsla(156, 86%, 64%, 1);
  --cl-blue: hsla(218, 91%, 78%, 1);
  --cl-pink: hsla(314, 100%, 85%, 1);
  --cl-yellow: hsla(58, 92%, 79%, 1);
  --background: var(--cl-background);
  --background-50: var(--cl-background-50);
  --background-100: var(--cl-background-100);
  --background-200: var(--cl-background-200);
  --background-300: var(--cl-background-300);
  --background-400: var(--cl-background-400);
  --background-500: var(--cl-background-500);
  --background-700: var(--cl-background-700);
  --foreground: var(--cl-foreground);
  --primary: var(--cl-primary);
  --primary-foreground: var(--cl-primary-foreground);
  --muted: var(--cl-background-200);
  --muted-foreground: var(--cl-muted);
  --border: var(--cl-border);
  --input: var(--cl-border);
  --card: var(--cl-background);
  --card-foreground: var(--cl-foreground);
  --secondary: var(--cl-background-200);
  --secondary-foreground: var(--cl-primary);
  --accent: var(--cl-background-200);
  --accent-foreground: var(--cl-primary);
  --cossistant-pink: var(--cl-pink);
  --cossistant-yellow: var(--cl-yellow);
  --cossistant-blue: var(--cl-blue);
  --cossistant-orange: var(--cl-orange);
  --cossistant-green: var(--cl-green);
  --co-background: var(--cl-background);
  --co-background-100: var(--cl-background-100);
  --co-background-200: var(--cl-background-200);
  --co-background-300: var(--cl-background-300);
  --co-background-400: var(--cl-background-400);
  --co-foreground: var(--cl-foreground);
  --co-muted-foreground: var(--cl-muted);
  --co-border: var(--cl-border);
  --co-orange: var(--cl-orange);
  --fake-dashboard-height-mobile: 720px;
  --fake-dashboard-width-mobile: 1280px;
  --fake-dashboard-height-sm: 560px;
  --fake-dashboard-height-md: 640px;
  --fake-dashboard-height-lg: 740px;
  --fake-dashboard-height-xl: 820px;
  background: var(--cl-background);
  color: var(--cl-foreground);
  font-family: var(--font-geist-mono, "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace);
  min-height: 100svh;
  overflow: clip;
  position: relative;
  text-rendering: optimizeLegibility;
  width: 100%;
}

.cossistant-landing *,
.cossistant-landing *::before,
.cossistant-landing *::after {
  box-sizing: border-box;
}

.cossistant-landing :where(a) {
  color: inherit;
  text-decoration: none;
}

.cl-font-stout {
  font-family: "F37Stout", var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif);
  font-weight: 400;
  letter-spacing: -0.045em;
}

.cl-container-wrapper {
  border-left: 1px dashed var(--cl-border);
  border-right: 1px dashed var(--cl-border);
  margin: 0 auto;
  max-width: 1400px;
  position: relative;
  width: 100%;
}

.cl-container {
  margin: 0 auto;
  max-width: 1536px;
  padding-left: 1rem;
  padding-right: 1rem;
  width: 100%;
}

.cl-main {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.cl-full-width-border {
  border-top: 1px dashed var(--cl-border);
  left: 50%;
  pointer-events: none;
  position: absolute;
  transform: translateX(-50%);
  width: 100vw;
}

.cl-topbar {
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 50;
}

.cl-topbar-fill {
  background: var(--cl-background);
  border-bottom: 1px solid var(--cl-background);
  height: 4rem;
  left: 0;
  min-height: 4rem;
  min-width: 100vw;
  position: fixed;
  right: 0;
  top: 0;
}

.cl-topbar-inner {
  align-items: center;
  background: var(--cl-background);
  display: flex;
  gap: 1rem;
  min-height: 4rem;
  padding-bottom: 1rem;
  padding-top: 1rem;
  position: relative;
  z-index: 50;
}

.cl-topbar-logo-wrap {
  align-items: center;
  display: flex;
  gap: 0.375rem;
  min-width: 280px;
}

.cl-logo-text {
  align-items: center;
  display: flex;
  gap: 0.25rem;
  line-height: 1;
  padding-bottom: 3px;
  white-space: nowrap;
}

.cl-logo-word {
  font-size: 24px;
  letter-spacing: -0.05em;
  line-height: 24px;
}

.cl-nav {
  align-items: center;
  display: flex;
  flex: 1;
  gap: 1rem;
  justify-content: center;
}

.cl-nav-link,
.cl-topbar-button,
.cl-search {
  align-items: center;
  border-radius: 0.5rem;
  display: inline-flex;
  font-size: 0.875rem;
  line-height: 1.25rem;
  min-height: 2.25rem;
  padding: 0.5rem 0.75rem;
  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
}

.cl-nav-link:hover,
.cl-topbar-button:hover {
  background: var(--cl-background-200);
}

.cl-topbar-actions {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-left: auto;
  min-width: 280px;
}

.cl-search,
.cl-topbar-button {
  border: 1px dashed var(--cl-border);
}

.cl-search {
  color: color-mix(in oklab, var(--cl-primary), transparent 50%);
}

.cl-button {
  align-items: center;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  display: inline-flex;
  font-size: 1rem;
  font-weight: 500;
  height: 3rem;
  justify-content: center;
  line-height: 1.5rem;
  padding: 0 1.25rem;
  transition: background 160ms ease, color 160ms ease, transform 160ms ease;
}

.cl-button:hover {
  transform: translateY(-1px);
}

.cl-button-primary {
  background: var(--cl-primary);
  color: var(--cl-primary-foreground);
}

.cl-button-primary:hover {
  background: color-mix(in oklab, var(--cl-primary), white 8%);
  color: var(--cl-primary-foreground);
}

.cl-button-ghost {
  color: var(--cl-primary);
  justify-content: space-between;
}

.cl-button-ghost:hover {
  background: var(--cl-background-200);
  color: var(--cl-primary);
}

.cossistant-landing .cl-button-primary {
  color: var(--cl-primary-foreground);
}

.cossistant-landing .cl-button-ghost {
  color: var(--cl-primary);
}

.cl-hero {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 100vh;
  padding-top: 8rem;
}

.cl-hero-copy {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem 0.75rem;
}

.cl-eyebrow {
  color: var(--cl-orange);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1rem;
}

.cl-hero-title {
  font-size: clamp(42px, 5vw, 64px);
  line-height: 1.04;
  margin: 0;
  max-width: 960px;
  text-wrap: balance;
}

.cl-hero-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
  width: 100%;
}

.cl-browser-section {
  display: block;
  position: relative;
  width: 100%;
}

.cl-browser-stage {
  align-items: center;
  background: var(--cl-background-200);
  display: flex;
  height: clamp(440px, 46vw, 620px);
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.cl-browser-stage::before {
  background:
    radial-gradient(circle at 13% 25%, color-mix(in oklab, var(--cl-orange), transparent 72%) 0, transparent 34%),
    radial-gradient(circle at 82% 32%, color-mix(in oklab, var(--cl-green), transparent 75%) 0, transparent 32%),
    radial-gradient(circle at 55% 91%, color-mix(in oklab, var(--cl-blue), transparent 79%) 0, transparent 34%);
  content: "";
  inset: 0;
  position: absolute;
}

.cl-browser-stage::after {
  background: linear-gradient(115deg, rgba(0, 0, 0, 0.03), transparent 22%, rgba(255, 255, 255, 0.45) 52%, transparent 72%);
  content: "";
  inset: 0;
  position: absolute;
}

.cl-browser-content {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  max-width: 1450px;
  overflow: hidden;
  padding: 1rem;
  pointer-events: none;
  position: relative;
  width: 100%;
  z-index: 1;
}

.fake-browser-wrapper {
  border: 1px solid var(--cl-border);
  box-shadow: 0 34px 80px color-mix(in oklab, var(--cl-primary), transparent 88%);
  overflow: hidden;
  width: 100%;
}

.cl-browser-shell {
  background: var(--cl-background);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
}

.cl-browser-chrome {
  align-items: center;
  border-bottom: 1px solid color-mix(in oklab, var(--cl-primary), transparent 94%);
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  padding: 0.25rem 1rem;
}

.cl-traffic {
  display: flex;
  gap: 0.5rem;
  width: 5rem;
}

.cl-dot {
  border-radius: 999px;
  height: 0.625rem;
  width: 0.625rem;
}

.cl-dot-red { background: #ef4444; }
.cl-dot-yellow { background: #eab308; }
.cl-dot-green { background: #22c55e; }

.cl-url {
  background: var(--cl-background-400);
  border-radius: 0.25rem;
  color: color-mix(in oklab, var(--cl-primary), transparent 40%);
  flex: 1;
  font-size: 0.75rem;
  max-width: 520px;
  overflow: hidden;
  padding: 0.125rem 0.5rem;
  text-overflow: ellipsis;
  text-align: center;
  white-space: nowrap;
}

.fake-dashboard-container {
  height: var(--fake-dashboard-height-mobile);
  width: 100%;
}

.cl-fake-dashboard {
  background: var(--cl-background-100);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
}

.cl-fake-nav {
  align-items: center;
  display: flex;
  gap: 1rem;
  height: 4rem;
  justify-content: space-between;
  min-height: 4rem;
  padding: 0 0.75rem 0 1.625rem;
  pointer-events: none;
}

.cl-fake-nav-left,
.cl-fake-nav-right {
  align-items: center;
  display: flex;
  gap: 0.75rem;
}

.cl-fake-nav-pill {
  align-items: center;
  border-radius: 0.25rem;
  color: color-mix(in oklab, var(--cl-primary), transparent 20%);
  display: inline-flex;
  font-size: 0.875rem;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
}

.cl-fake-help {
  background: var(--cl-background-300);
  color: var(--cl-primary);
}

.fake-central-container {
  display: flex;
  flex: 1;
  height: calc(var(--fake-dashboard-height-mobile) - 4rem);
  min-height: 0;
  padding: 0 0.5rem 0.5rem;
  width: 100%;
  will-change: contents;
  contain: layout style paint;
}

.cl-fake-central-shell {
  background: var(--cl-background);
  border: 1px solid var(--cl-border);
  border-radius: 0.25rem;
  display: grid;
  flex: 1;
  grid-template-columns: 260px 360px minmax(0, 1fr);
  height: 100%;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
}

.cl-fake-sidebar {
  background: var(--cl-background-50);
  border-right: 1px solid var(--cl-border);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  padding: 1rem;
}

.cl-fake-team {
  align-items: center;
  display: flex;
  gap: 0.625rem;
  font-weight: 600;
}

.cl-fake-search {
  background: var(--cl-background);
  border: 1px dashed var(--cl-border);
  border-radius: 0.75rem;
  color: var(--cl-muted);
  font-size: 0.75rem;
  padding: 0.625rem 0.75rem;
}

.cl-fake-menu {
  display: grid;
  gap: 0.5rem;
}

.cl-fake-menu-item {
  align-items: center;
  border-radius: 0.75rem;
  color: color-mix(in oklab, var(--cl-primary), transparent 30%);
  display: flex;
  font-size: 0.875rem;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
}

.cl-fake-menu-item.is-active {
  background: var(--cl-primary);
  color: var(--cl-primary-foreground);
}

.cl-fake-inbox {
  background: var(--cl-background);
  border-right: 1px solid var(--cl-border);
  min-width: 0;
  overflow: hidden;
}

.cl-fake-pane-head {
  border-bottom: 1px solid var(--cl-border);
  padding: 1rem;
}

.cl-fake-pane-head h3 {
  font-size: 0.875rem;
  margin: 0;
}

.cl-fake-pane-head p {
  color: var(--cl-muted);
  font-size: 0.75rem;
  margin: 0.25rem 0 0;
}

.cl-fake-conversation-list {
  display: grid;
  gap: 0.625rem;
  padding: 0.75rem;
}

.cl-fake-conversation-card {
  border: 1px solid var(--cl-border);
  border-radius: 0.875rem;
  display: grid;
  gap: 0.5rem;
  padding: 0.875rem;
}

.cl-fake-conversation-card.is-active {
  background: var(--cl-primary);
  border-color: var(--cl-primary);
  color: var(--cl-primary-foreground);
}

.cl-fake-card-top {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.cl-fake-card-title {
  font-size: 0.875rem;
  font-weight: 600;
}

.cl-fake-card-time,
.cl-fake-card-message {
  color: color-mix(in oklab, currentColor, transparent 42%);
  font-size: 0.75rem;
}

.cl-fake-chat {
  background: var(--cl-background);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cl-fake-chat-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
  overflow: hidden;
  padding: 1.25rem;
}

.cl-fake-message {
  border-radius: 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  max-width: 78%;
  padding: 0.875rem 1rem;
}

.cl-fake-message.visitor {
  background: var(--cl-background-200);
}

.cl-fake-message.agent {
  align-self: flex-end;
  background: color-mix(in oklab, var(--cl-orange), transparent 86%);
}

.cl-fake-message.note {
  border: 1px dashed color-mix(in oklab, var(--cl-primary), transparent 78%);
  background: var(--cl-background);
}

.cl-fake-composer {
  border-top: 1px solid var(--cl-border);
  padding: 1rem;
}

.cl-fake-input {
  background: var(--cl-background-50);
  border: 1px solid var(--cl-border);
  border-radius: 1rem;
  color: color-mix(in oklab, var(--cl-primary), transparent 45%);
  font-size: 0.875rem;
  padding: 0.875rem 1rem;
}

.cl-hero-meta {
  align-items: center;
  display: flex;
  flex-direction: column-reverse;
  gap: 2.5rem;
  justify-content: center;
  margin: 2.5rem 0 1.5rem;
  padding: 0 1.5rem;
}

.cl-frameworks {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.cl-framework-label,
.cl-animation-label {
  color: color-mix(in oklab, var(--cl-foreground), transparent 40%);
  font-size: 0.75rem;
}

.cl-framework-chip {
  align-items: center;
  border: 1px dashed var(--cl-border);
  border-radius: 0.375rem;
  display: inline-flex;
  font-size: 0.75rem;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
}

.cl-framework-icon {
  height: 1rem;
  width: 1rem;
}

.cl-animation-controls {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.cl-animation-dot {
  background: var(--cl-orange);
  border-radius: 999px;
  height: 0.5rem;
  width: 0.5rem;
}

.cl-narrative {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 10rem 1rem;
}

.cl-narrative h2 {
  color: color-mix(in oklab, var(--cl-primary), transparent 30%);
  font-size: clamp(2rem, 4vw, 2.75rem);
  line-height: 1.6;
  margin: 0 auto;
  max-width: 42rem;
  text-align: left;
  text-wrap: pretty;
}

.cl-narrative strong {
  color: var(--cl-primary);
  font-weight: inherit;
}

.cl-inline-logo {
  align-items: center;
  border: 1px dashed var(--cl-border);
  border-radius: 0.375rem;
  display: inline-flex;
  justify-content: center;
  margin: 0 0.125rem;
  padding: 0.25rem;
  vertical-align: middle;
}

.cl-precision {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.cl-precision-inner {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.cl-precision-copy {
  border-color: var(--cl-border);
  border-style: dashed;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
  padding: 4rem 1rem;
}

.cl-section-title {
  font-size: clamp(2.1rem, 4vw, 3rem);
  line-height: 1.1;
  margin: 0;
  max-width: 44rem;
  text-wrap: balance;
}

.cl-section-copy {
  color: color-mix(in oklab, var(--cl-primary), transparent 20%);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  max-width: 36rem;
  text-wrap: balance;
}

.cl-control-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.cl-control-chip {
  border: 1px dashed var(--cl-border);
  border-radius: 0.5rem;
  color: var(--cl-primary);
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.cl-precision-stage {
  align-items: center;
  background:
    radial-gradient(circle at 15% 18%, color-mix(in oklab, var(--cl-orange), transparent 80%), transparent 31%),
    radial-gradient(circle at 82% 80%, color-mix(in oklab, var(--cl-green), transparent 83%), transparent 34%),
    var(--cl-background-50);
  display: flex;
  flex: 1;
  justify-content: center;
  min-height: 560px;
  overflow: hidden;
  padding: 1.5rem;
}

.cl-flow-stack {
  display: grid;
  gap: 1rem;
  max-width: 34rem;
  width: 100%;
}

.cl-flow-card {
  background: color-mix(in oklab, var(--cl-background), transparent 6%);
  border: 1px dashed var(--cl-border);
  border-radius: 1rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.08);
  padding: 1.25rem;
}

.cl-flow-card:nth-child(2) {
  background: color-mix(in oklab, var(--cl-orange), transparent 91%);
  margin-left: 2.5rem;
}

.cl-flow-label {
  color: var(--cl-muted);
  font-size: 0.875rem;
  margin: 0 0 0.5rem;
}

.cl-flow-card p:last-child {
  font-size: 1.125rem;
  line-height: 1.4;
  margin: 0;
}

.cl-benefits {
  display: grid;
  gap: 3rem;
  padding-top: 3rem;
  position: relative;
}

.cl-benefits-head {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1rem;
}

.cl-benefits-grid {
  border-color: var(--cl-border);
  border-style: dashed;
  display: grid;
  position: relative;
}

.cl-benefit {
  border-bottom: 1px dashed var(--cl-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
  padding: 5rem 1rem 2rem;
  position: relative;
}

.cl-benefit-graphic {
  height: 18rem;
  position: relative;
  width: 100%;
  z-index: 1;
}

.cl-self-learning-graphic {
  display: grid;
  height: 100%;
  margin-left: -4rem;
  place-items: center;
  position: absolute;
  inset: 0;
}

.cl-knowledge-card {
  background:
    linear-gradient(90deg, transparent 0 58%, var(--cl-background) 92%),
    var(--cl-background-50);
  border: 1px dashed color-mix(in oklab, var(--cl-primary), transparent 82%);
  border-radius: 0.25rem;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  font-size: 0.8125rem;
  grid-area: 1 / 1;
  height: 8rem;
  justify-content: space-between;
  padding: 0.75rem;
  position: relative;
  transform: skewY(-8deg);
  transition: transform 180ms ease, border-color 180ms ease;
  width: 22rem;
}

.cl-knowledge-card:hover {
  border-color: color-mix(in oklab, var(--cl-primary), transparent 70%);
}

.cl-knowledge-card.one {
  transform: skewY(-8deg) translate(-2rem, -2rem);
}

.cl-knowledge-card.two {
  transform: skewY(-8deg) translate(1rem, 1.1rem);
}

.cl-knowledge-card.three {
  transform: skewY(-8deg) translate(4rem, 4.2rem);
}

.cl-knowledge-card > div:first-child {
  color: var(--cl-orange);
  font-weight: 600;
}

.cl-knowledge-card > p:nth-child(2) {
  color: color-mix(in oklab, var(--cl-primary), transparent 40%);
  line-height: 1.45;
}

.cl-knowledge-card > p:last-child {
  color: color-mix(in oklab, var(--cl-primary), transparent 60%);
  font-size: 0.625rem;
}

.cl-tools-graphic {
  height: 100%;
  position: relative;
}

.cl-tools-beams {
  inset: 8% 4%;
  position: absolute;
}

.cl-tools-beams path {
  stroke: color-mix(in oklab, var(--cl-primary), transparent 82%);
  stroke-dasharray: 7 7;
  stroke-linecap: round;
  stroke-width: 1.25;
}

.cl-tools-beams .cl-beam-flow {
  animation: cl-dash-flow 3.8s linear infinite;
  stroke: var(--cl-orange);
  stroke-dasharray: 18 250;
  stroke-opacity: 0.9;
}

.cl-tools-beams .cl-beam-flow.reverse {
  animation-direction: reverse;
}

.cl-tools-beams .cl-beam-flow.slow {
  animation-duration: 5.2s;
}

.cl-tool-node,
.cl-tool-core {
  align-items: center;
  background: var(--cl-background-100);
  border: 1px dashed color-mix(in oklab, var(--cl-primary), transparent 78%);
  border-radius: 0.25rem;
  display: flex;
  justify-content: center;
  position: absolute;
  z-index: 2;
}

.cl-tool-node {
  color: color-mix(in oklab, var(--cl-primary), transparent 22%);
  font-size: 0.55rem;
  height: 3rem;
  line-height: 1.05;
  text-align: center;
  width: 3rem;
}

.cl-tool-core {
  color: var(--cl-primary);
  height: 5rem;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 5rem;
}

.cl-tool-core svg {
  height: 2rem;
  width: 2.4rem;
}

.cl-tool-node.top-left { left: 6%; top: 8%; }
.cl-tool-node.mid-left { left: 6%; top: 43%; }
.cl-tool-node.bottom-left { bottom: 8%; left: 6%; }
.cl-tool-node.top-right { right: 6%; top: 8%; }
.cl-tool-node.mid-right {
  background: var(--cl-orange);
  color: var(--cl-primary);
  font-weight: 700;
  right: 12%;
  top: 43%;
}
.cl-tool-node.bottom-right { bottom: 8%; right: 6%; }

.cl-prompt-graphic {
  color: color-mix(in oklab, var(--cl-primary), transparent 42%);
  font-size: 0.86rem;
  line-height: 1.6;
  overflow: hidden;
  padding-top: 0.25rem;
  position: relative;
  white-space: nowrap;
}

.cl-prompt-graphic::after {
  background:
    linear-gradient(to top, var(--cl-background) 0%, transparent 100%),
    linear-gradient(to left, var(--cl-background) 0%, transparent 100%);
  bottom: 0;
  content: "";
  height: 45%;
  left: 0;
  pointer-events: none;
  position: absolute;
  right: 0;
}

.cl-prompt-graphic p {
  animation: cl-line-fade 420ms ease forwards;
  margin: 0 0 0.35rem;
  opacity: 0;
}

.cl-prompt-muted {
  color: color-mix(in oklab, var(--cl-primary), transparent 68%);
}

.cl-benefit h3 {
  font-size: 1rem;
  margin: 1rem 0 0;
  position: relative;
  z-index: 1;
}

.cl-benefit p {
  color: var(--cl-muted);
  line-height: 1.6;
  margin: 0;
  max-width: 34rem;
  text-wrap: balance;
}

.cl-install {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: calc(100vh - 20px);
  position: relative;
}

.cl-install-inner {
  display: flex;
  flex: 1;
  flex-direction: column-reverse;
}

.cl-install-preview {
  align-items: center;
  background: var(--cl-background-100);
  border-color: var(--cl-border);
  border-style: dashed;
  display: flex;
  flex: 1;
  justify-content: center;
  min-height: 450px;
  padding: 1.5rem;
  padding-top: 1rem;
}

.cl-component-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 50rem;
  width: 100%;
}

.cl-preview-tabs {
  align-items: center;
  display: flex;
  gap: 2rem;
  min-height: 2rem;
  padding: 0 1.5rem;
}

.cl-preview-tabs span {
  color: var(--cl-muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.cl-preview-tabs span:first-child {
  color: var(--cl-primary);
}

.cl-preview-tabs span:first-child::first-letter {
  color: var(--cl-orange);
}

.cl-preview-frame {
  align-items: center;
  background:
    radial-gradient(circle at 24% 45%, color-mix(in oklab, var(--cl-primary), transparent 92%), transparent 34%),
    transparent;
  display: flex;
  flex: 1;
  justify-content: center;
  min-height: 420px;
  overflow: hidden;
  padding: 2rem;
  position: relative;
}

.cl-support-card {
  background: #050505;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.25rem;
  box-shadow: 0 34px 90px rgba(0, 0, 0, 0.22);
  color: #f4f4f5;
  min-height: 30rem;
  overflow: hidden;
  position: relative;
  width: min(34rem, 92vw);
  z-index: 2;
}

.cl-support-header {
  align-items: center;
  background: #050505;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: 2rem 1fr 2.5rem 2rem;
  padding: 1.5rem 1.75rem 1rem;
}

.cl-support-header button {
  background: transparent;
  border: 0;
  color: #f4f4f5;
  cursor: pointer;
  font: inherit;
  font-size: 1.75rem;
  line-height: 1;
}

.cl-support-header p {
  color: #f4f4f5;
  font-weight: 600;
  margin: 0;
}

.cl-support-header span {
  color: rgba(244, 244, 245, 0.65);
  display: block;
  margin-top: 0.25rem;
}

.cl-agent-avatar {
  border-radius: 0.125rem;
  height: 2.5rem;
  object-fit: cover;
  width: 2.5rem;
}

.cl-support-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.75rem 2rem 5.25rem;
}

.cl-support-message {
  border-radius: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.45;
  max-width: 27rem;
  padding: 0.875rem 1rem;
}

.cl-support-message.visitor {
  align-self: flex-start;
  background: #f4f4f5;
  color: #171717;
}

.cl-support-message.agent {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(244, 244, 245, 0.86);
}

.cl-support-time {
  align-self: flex-end;
  color: rgba(244, 244, 245, 0.6);
}

.cl-support-author {
  color: rgba(244, 244, 245, 0.55);
  margin-top: 1.5rem;
}

.cl-preview-code {
  bottom: 3rem;
  color: rgba(244, 244, 245, 0.38);
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.3;
  margin: 0;
  position: absolute;
  right: 6%;
  width: 11rem;
}

.cl-install-copy {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  padding: 4rem 1rem;
}

.cl-command-tabs {
  background: var(--cl-background-100);
  border: 1px dashed var(--cl-border);
  border-radius: 0.75rem;
  margin-top: 1.5rem;
  padding: 1rem;
}

.cl-tabs {
  color: color-mix(in oklab, var(--cl-primary), transparent 50%);
  display: flex;
  font-size: 0.75rem;
  gap: 0.75rem;
}

.cl-tabs span:first-child {
  color: var(--cl-primary);
}

.cl-command {
  display: block;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.cl-install-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.cl-footer {
  border-top: 1px dashed var(--cl-border);
  display: flex;
  flex-direction: column;
  margin-top: 4rem;
}

.cl-footer-main {
  padding: 3rem 0.5rem;
}

.cl-footer-grid {
  display: grid;
  gap: 2rem;
  padding: 0 0.5rem;
}

.cl-footer-brand {
  grid-column: span 1;
}

.cl-footer-copy {
  color: color-mix(in oklab, var(--cl-foreground), transparent 40%);
  font-size: 0.875rem;
  line-height: 1.6;
  max-width: 32rem;
}

.cl-github-link {
  border: 1px dashed var(--cl-border);
  border-radius: 0.5rem;
  color: color-mix(in oklab, var(--cl-foreground), transparent 30%);
  display: inline-flex;
  font-size: 0.875rem;
  margin-top: 2.5rem;
  padding: 0.5rem 1rem;
}

.cl-footer h3 {
  font-size: 0.875rem;
  margin: 0 0 1rem;
}

.cl-footer ul {
  display: grid;
  gap: 0.75rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.cl-footer li,
.cl-footer a {
  color: color-mix(in oklab, var(--cl-foreground), transparent 40%);
  font-size: 0.875rem;
}

.cl-footer a:hover {
  color: var(--cl-foreground);
}

.cl-footer-bottom {
  border-top: 1px dashed var(--cl-border);
  min-height: 25rem;
  overflow: hidden;
  position: relative;
}

.cl-footer-bottom-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: space-between;
  padding: 1rem;
  position: relative;
  z-index: 2;
}

.cl-footer-bottom-links {
  display: flex;
  gap: 1.5rem;
}

.cl-footer-watermark {
  bottom: -0.35em;
  color: var(--cl-background-300);
  font-size: clamp(7rem, 20vw, 19rem);
  left: 50%;
  line-height: 0.8;
  pointer-events: none;
  position: absolute;
  transform: translateX(-50%);
  white-space: nowrap;
  z-index: 1;
}

.cl-background-grid {
  background-image:
    linear-gradient(to right, color-mix(in oklab, var(--cl-primary), transparent 95%) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklab, var(--cl-primary), transparent 95%) 1px, transparent 1px);
  background-size: 34px 34px;
  inset: 0;
  opacity: 0.8;
  position: absolute;
}

@keyframes cl-dash-flow {
  from {
    stroke-dashoffset: 0;
  }

  to {
    stroke-dashoffset: -268;
  }
}

@keyframes cl-line-fade {
  from {
    opacity: 0;
    transform: translateY(0.35rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 640px) {
  .fake-dashboard-container {
    height: var(--fake-dashboard-height-sm);
  }

  .fake-central-container {
    height: calc(var(--fake-dashboard-height-sm) - 4rem);
  }

  .cl-hero-actions {
    max-width: 75%;
  }
}

@media (min-width: 768px) {
  .cl-footer-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .cl-footer-brand {
    grid-column: span 2;
  }

  .cl-footer-bottom-row {
    align-items: flex-start;
    flex-direction: row;
  }
}

@media (min-width: 1024px) {
  .cl-topbar-inner {
    justify-content: space-between;
  }

  .cl-hero-actions {
    align-items: center;
    flex-direction: row;
    max-width: 100%;
  }

  .cl-button-primary {
    width: 250px;
  }

  .fake-dashboard-container {
    height: var(--fake-dashboard-height-md);
  }

  .fake-central-container {
    height: calc(var(--fake-dashboard-height-md) - 4rem);
  }

  .fake-browser-wrapper {
    height: 720px !important;
    max-width: none !important;
    transform: scale(0.75) !important;
    transform-origin: center center !important;
    width: 1280px !important;
  }

  .fake-browser-wrapper > div {
    height: 720px !important;
    min-height: 720px !important;
  }

  .fake-browser-wrapper .fake-dashboard-container {
    height: calc(720px - 2.25rem) !important;
  }

  .fake-browser-wrapper .fake-central-container {
    height: calc(720px - 2.25rem - 4rem - 0.5rem) !important;
  }

  .cl-hero-meta {
    flex-direction: row;
    justify-content: space-between;
    margin-top: auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .cl-precision-inner {
    flex-direction: row;
    min-height: 100vh;
  }

  .cl-precision-copy {
    border-right: 1px dashed var(--cl-border);
    flex-basis: 50%;
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .cl-precision-stage {
    flex-basis: 50%;
  }

  .cl-benefits-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .cl-benefit {
    border-bottom: 0;
    grid-column: span 2;
    padding: 4rem 2rem 2rem;
  }

  .cl-benefit:not(:last-child) {
    border-right: 1px dashed var(--cl-border);
  }

  .cl-install-inner {
    flex-direction: row;
  }

  .cl-install-preview {
    border-right: 1px dashed var(--cl-border);
    min-height: 730px;
  }

  .cl-install-copy {
    padding-left: 2rem;
    padding-right: 2rem;
    width: 50%;
  }

  .cl-footer {
    border-top-color: transparent;
    margin-top: 0;
  }

  .cl-footer-main {
    padding-top: 15rem;
  }
}

@media (min-width: 1280px) {
  .fake-dashboard-container {
    height: var(--fake-dashboard-height-lg);
  }

  .fake-central-container {
    height: calc(var(--fake-dashboard-height-lg) - 4rem);
  }

  .fake-browser-wrapper {
    height: auto !important;
    max-width: 1450px !important;
    transform: scale(0.9) !important;
    transform-origin: center !important;
    width: 100% !important;
  }
}

@media (min-width: 1536px) {
  .fake-dashboard-container {
    height: var(--fake-dashboard-height-xl);
  }

  .fake-central-container {
    height: calc(var(--fake-dashboard-height-xl) - 4rem);
  }
}

@media (max-width: 767px) {
  .cl-nav,
  .cl-search,
  .cl-logo-word {
    display: none;
  }

  .cl-topbar-logo-wrap,
  .cl-topbar-actions {
    min-width: auto;
  }

  .cl-browser-stage {
    height: clamp(360px, 82vw, 430px);
  }

  .fake-browser-wrapper {
    height: 720px !important;
    max-width: none !important;
    transform: scale(0.42) !important;
    transform-origin: center center !important;
    width: 1280px !important;
  }

  .fake-browser-wrapper > div {
    height: 720px !important;
    min-height: 720px !important;
  }

  .fake-browser-wrapper .fake-dashboard-container {
    height: calc(720px - 2.25rem) !important;
  }

  .fake-browser-wrapper .fake-central-container {
    height: calc(720px - 2.25rem - 4rem - 0.5rem) !important;
  }
}

@media (max-width: 1023px) {
  .cl-fake-central-shell {
    grid-template-columns: 240px minmax(0, 1fr);
  }

  .cl-fake-sidebar {
    display: none;
  }
}
`;
