# Portfolio V2 — Design Brief
> Animation-rich, graphic-heavy redesign for Pulkit Dhingra's AI Engineer portfolio.
> Inspired by: Brittany Chiang, Andrej Karpathy, 2025 glassmorphism + bento grid trends.

---

## Core Concept
**"Infrastructure as Aesthetic"** — feels like a GPU cluster monitoring dashboard meets a research IDE. Dark, signal-dense, unmistakably premium. Proves you live in the AI domain, not just learned it for a portfolio.

---

## Color Tokens
```css
--bg:          #080D14   /* near-black base */
--bg2:         #0D1421   /* card/panel backgrounds */
--bg3:         #111A2E   /* elevated surfaces */
--cyan:        #22D3EE   /* primary accent */
--blue:        #3B82F6   /* secondary accent */
--purple:      #8B5CF6   /* tertiary / git hashes / tags */
--green:       #10B981   /* status / success */
--amber:       #F59E0B   /* highlights / impact stats */
--text1:       #F8FAFC   /* headlines */
--text2:       #94A3B8   /* body */
--text3:       #475569   /* muted / labels */
```

---

## Typography
| Role | Font | Weight |
|---|---|---|
| Display / Name | **Space Grotesk** | 700 |
| Section headings | **Space Grotesk** | 600 |
| Body text | **Inter** | 400, 500 |
| Code / Terminal / Badges | **JetBrains Mono** | 400, 700 |

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

Section headings use an **eyebrow pattern** instead of ghost-text watermarks:
```html
<span class="eyebrow">// 01 — About Me</span>
<h2 class="section-title">Solving Problems with 0s and 1s</h2>
```

---

## Tech Stack (no Bootstrap, no jQuery)
- Vanilla HTML5 / CSS3 / ES6+
- CSS Grid + Flexbox (no Bootstrap)
- Canvas API — neural network animation (no particles.js)
- IntersectionObserver — scroll reveals (no AOS)
- Custom typed text — ~50 lines vanilla JS (no Typed.js)
- Chart.js — radar chart (keep)
- Font Awesome 6
- Google Fonts: Space Grotesk + Inter + JetBrains Mono
- Keep: Google Analytics, Chatbase chatbot

---

## Page Sections & Nav
```
Nav: PD logo | About · Experience · Skills · Projects · Profiles · Research | Status Pill + Hire Me

#home        → Hero
#about       → About
#experience  → Experience / Education tabs
#skills      → Skills
#projects    → Projects
#profiles    → Contributions
#research    → Research Papers
#testimonials → Testimonials (carousel, no dedicated nav link)
Footer       → CLI-style contact links
```

---

## Section-by-Section Design

### 1. Navigation (fixed, glass blur)
- Transparent → `rgba(8,13,20,0.92) + backdrop-filter: blur(24px)` after 60px scroll
- Left: `PD` monogram in cyan→blue gradient text
- Center: Inter 500 links, cyan underline slide-in on hover/active
- Right: pulsing green "Open to Work" pill + "Hire Me" ghost button (cyan border)
- Mobile: slide-down drawer

### 2. Hero (100vh)
**Background:** Canvas neural network + 3 animated radial blob divs (blur 90px)

**Layout:** 2-column grid (text left, image right)

**Left column:**
- Eyebrow: `// AI Engineer & Data Scientist` (JetBrains Mono, cyan)
- Name: `Pulkit Dhingra` — Space Grotesk 700, `clamp(2.8rem, 7vw, 5.5rem)`, white→slate gradient text-fill
- Typed role: custom vanilla JS typer cycling: `>> Agentic AI Engineer` / `>> MLOps Architect` / `>> LLM Systems Builder` / `>> Data Scientist`
- Bio: 2-3 sentence sharp description mentioning Ford + Bristol
- CTAs: `Download Resume` (gradient solid) + `Tech Blogs` (ghost border)
- Social icons: GitHub, LinkedIn, HuggingFace (🤗), Kaggle, Email — 38px circle buttons
- Stat pills: `⚙ Ford Motor Company` · `🎓 MSc Bristol` · `🏢 3+ Years` · `🌍 Bristol, UK`
- Subtle scroll indicator (animated line + "scroll" label)

**Right column:**
- Profile photo with **rotating conic-gradient border** (cyan→blue→purple, spinRing animation)
- 2 floating glassmorphism badges: `AI Engineer @ Ford` (top-right) + `MSc Data Science, Bristol` (bottom-left), floating up/down on loop

### 3. Neural Network Canvas
Custom Canvas API (~80 lines), replaces particles.js:
- 70 nodes, random positions + velocities (0.5px/frame)
- Nodes wrap at canvas edges
- Edges drawn between nodes within 130px; opacity = `(1 - dist/130) * 0.15`
- **Mouse repel**: nodes within 100px gently push away
- **Pulse propagation**: every 3-5s, random node "fires" (pulse=1), propagates to nearby nodes with distance-based delay → glowing cyan ripple through the network
- Colors: `rgba(34,211,238, alpha)` for both nodes and edges

### 4. About
- 2-column: photo (left, full-height, subtle gradient overlay) + content (right)
- Punchy bio paragraph
- **JSON panel** with typing animation (IntersectionObserver triggers char-by-char type-in at 14ms/char, syntax-highlighted spans for keys/strings/available status)
- Hire Me + LinkedIn buttons (magnetic effect)

### 5. Impact Stats
4 glassmorphism cards, 4-column grid:
- `$100M+` Value Generated at Ford
- `3+` Years Building AI Systems
- `2` Research Publications
- `15+` Projects Shipped

Each card: top 2px gradient accent line, `easeOutExpo` count-up animation on scroll-enter, count triggered via IntersectionObserver.

### 6. Experience / Education
Tab toggle (pill tabs: `Experience` | `Education`)

**Vertical left-anchored timeline:**
- 2px gradient line on left (cyan → transparent)
- Dot at each entry: `border: 2px solid cyan`, hover fills with cyan + glow
- Each entry: period (mono, muted) → role + git-hash badge (purple) → company (cyan) → description → tech badges

**Experience entries:**
1. AI Engineer @ Ford — `a3f2c1d` — Jan 2026–Present — `[Google ADK, Model Armor, Kubernetes, Cloud Run, MLOps, MCP Servers]`
2. Data Scientist @ Ford — `b7e9d4a` — Jan 2023–Aug 2024 — `[Python, Agentic AI, Qlik, Power BI, dbt, GCP]` — **$100M value callout**
3. DevOps Engineer @ Nagarro — `c5f1b8e` — May–Dec 2022 — `[Jenkins, Docker, K8s, Terraform, Grafana]`
4. Data Science Intern @ RAI4Y — `d2a4f7c` — Jan–Apr 2021 — `[Python, ML, Mentorship]`

### 7. Skills
2-column layout: tag cloud (left) + radar chart (right)

**No progress bars.** Instead, categorised skill tags:
- AI/ML Domains: `[Agentic AI] [LLM Fine-tuning] [RAG Systems] [MLOps] [NLP] [Computer Vision] [Data Science]` — cyan
- Languages: `[Python] [SQL] [R] [Java] [Bash]` — blue
- Frameworks: `[LangChain] [PyTorch] [HuggingFace] [FastAPI] [Google ADK] [Apache Spark]` — purple
- Cloud/DevOps: `[GCP] [AWS] [Azure] [Kubernetes] [Docker] [Terraform] [Jenkins]` — green
- Data/Viz: `[dbt] [Tableau] [Power BI] [Qlik Sense] [Plotly Dash] [BigQuery]` — amber

Tags animate in **staggered** (55ms delay each) on IntersectionObserver, spring scale from 0.8 to 1. Hover: scale(1.1), glow.

**Radar chart** (Chart.js): dark glassmorphism card, cyan fill, `rgba(34,211,238,0.1)` background, JetBrains Mono labels. Labels: Python, AI/LLM, Data Science, DevOps, Visualisation, DBT/SQL. Values: 95, 95, 90, 80, 90, 85.

### 8. Projects (Bento Grid)
3-column CSS Grid with variable card sizes:

```
[─── Automated Document Parser (featured, span 2) ───][Query Agent]
[Hindi GPT Neo][─────── Price Trends e-Commerce (featured, span 2) ──────]
[UK Demographics Viz][Hitlog Processing]
```

**Filter bar** (pill buttons): `All | Agentic AI | LLM | Data Science | Engineering`

Each card:
- `data-cat` attribute for filtering
- macOS traffic-light dots + terminal path header
- Category label (JetBrains Mono, purple, small caps)
- Title (Space Grotesk 600) + description + tech badges
- GitHub/HuggingFace link row
- **Mouse-tracking glow**: `radial-gradient(circle at var(--mx) var(--my), rgba(34,211,238,0.05), transparent 60%)` tracks cursor position within card
- Hover: `translateY(-7px) scale(1.01)` + cyan border glow

### 9. Profiles / Contributions
3×2 grid of platform cards:
- Kaggle (cyan), Tableau (orange), HackerRank (green), Credly (orange-red), GeeksforGeeks (green), LeetCode (amber)
- Each: top 3px gradient accent, platform icon, name, one-line description
- Hover: `translateY(-6px)`, border glow, arrow icon shifts diagonally

### 10. Research Papers
Vertical list, 2 paper cards:
1. Glass Identification Using XGBoost (IJSRET, 2021)
2. Sketch To Face — Deep Learning Facial Reconstruction (IJSRET, 2022)

Each card: paper number + year (mono cyan) → title (Space Grotesk) → journal (italic muted) → abstract excerpt → tech tags → PDF link button. Hover: `translateX(5px)`.

### 11. Testimonials
CSS-only carousel (transform translateX):
- 3 slides: Ritika Pandey, Tushar Srivastava, RadheKrishna Singh
- Glassmorphism card, large `"` quote in cyan→purple gradient text-fill
- Person: photo (50px circle, cyan border) + name + LinkedIn link
- Prev/Next buttons + dot indicators (active dot expands to pill)
- Auto-advance every 5.5s

### 12. Footer (CLI style)
- Large headline: `Let's Build Something` (gradient text)
- Subtitle: `Open to AI Engineer, Data Science, and MLOps opportunities.`
- 5 CLI-style link rows: `$ open linkedin.com/...`, `$ open github.com/...`, etc.
- Hover: `translateX(5px)` + cyan border
- Blinking cursor `▌` at bottom

---

## Animation System

### Scroll Reveal (IntersectionObserver — no AOS)
```css
.reveal       { opacity:0; transform:translateY(28px); transition: 0.7s ease; }
.reveal-left  { opacity:0; transform:translateX(-40px); }
.reveal-right { opacity:0; transform:translateX(40px); }
.reveal-scale { opacity:0; transform:scale(0.92); }
.in-view      { opacity:1; transform:none; }
/* Stagger: .d1 → d6 = transition-delay 0.08s increments */
```

### Key Custom Animations
| Animation | What it does |
|---|---|
| `spinRing` | Conic gradient border rotates around profile photo (7s linear infinite) |
| `blobFloat` | Hero background blobs translate up/down softly (9s ease-in-out) |
| `floatA/B` | Hero floating badges gently bob up/down (3s, offset phases) |
| `statusPulse` | Green dot expands/fades box-shadow (2s ease-in-out) |
| `blink` | Cursor `▌` blinks (1s step-end) |
| `scrollPulse` | Scroll indicator line breathes (2s ease-in-out) |
| Neural pulse | Node glows, edge brightens, propagates to neighbours via setTimeout delay |
| JSON type-in | Char-by-char at 14ms with live syntax highlighting |
| Counter easeOutExpo | `1 - 2^(-10t)` easing on count-up (1800ms) |
| Skill tag stagger | 55ms delay × index, spring scale 0.8→1 |
| Magnetic buttons | `translate(dx*0.28, dy*0.28)` on mousemove, reset on leave |
| Card mouse glow | `radial-gradient` at `--mx/--my` CSS custom properties |

---

## What's Deliberately Removed vs Current
| Current | V2 |
|---|---|
| Bootstrap 4 + jQuery | Vanilla CSS Grid + ES6 |
| AOS library | Native IntersectionObserver |
| Typed.js | 50-line custom typer |
| particles.js | Canvas API neural network |
| Progress bars for skills | Tag cloud + radar chart |
| Roboto font | Space Grotesk + Inter + JetBrains Mono |
| Ghost text section headers | Eyebrow mono label + clean title |
| Owl Carousel | CSS transform carousel |
| Image overlays on profile links | Clean glassmorphism platform cards |
| Mixed light/dark sections | Consistent dark throughout |

---

## Files to Reference for Content
- `index.html` — all copy, links, project descriptions, experience text
- `img/profile_2.jpeg` — hero photo
- `img/profile_4.jpeg` — about section photo
- `img/testimonial-1/2/3.jpg` — testimonial avatars
- `resume/Pulkit_Resume.pdf` — resume download

---

## External Resources Needed
```html
<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<!-- Icons -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```
No other external dependencies. All animation is vanilla JS + CSS.
