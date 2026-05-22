# 🛡️ Content Moderation AI - Pitch-Ready Project Overview & Core Features

Welcome to the official, pitch-ready technical overview and feature guide for the **Content Moderation AI** system. This document outlines the system's design, modular pipelines, machine learning architecture, database schema, and premium user experience (UX) to support project pitches, client demonstrations, and technical presentations.

---

## 📐 SYSTEM ARCHITECTURE AT A GLANCE

The platform is designed with a **modern, decoupled single-repo architecture** that guarantees high availability, parallel processing efficiency, and horizontal scalability:

```
                      ┌────────────────────────────────────────┐
                      │          FRONTEND (React 18)           │
                      │   - Glassmorphic UI with Video BG      │
                      │   - Live Stats, Dashboard & Charts     │
                      │   - Admin Management (CRUD Operations) │
                      └──────────────────┬─────────────────────┘
                                         │
                                         │ REST API Calls (Axios)
                                         ▼
                      ┌────────────────────────────────────────┐
                      │        BACKEND (FastAPI / Python)      │
                      │   - Port: 8000 (Local / Production)    │
                      │   - Async Endpoints for Parallel Tasks │
                      └──────────────────┬─────────────────────┘
                                         │
         ┌───────────────────────────────┼──────────────────────────────┐
         ▼                               ▼                              ▼
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│  SQLITE DATABASE │           │   ML PIPELINE    │           │ DOCUMENT/VIDEO   │
│ (database.py)    │           │ (transformers)   │           │   PARSERS        │
│                  │           │                  │           │                  │
│ Tables:          │           │ - ToxicBERT      │           │ - PyPDF2 (PDF)   │
│ - submissions    │           │ - DeHateBERT     │           │ - docx (Word)    │
│ - results        │           │ - Zero-Shot BART │           │ - openpyxl (XL)  │
│ - reviews        │           │ - ViT NSFW Image │           │ - pptx (Slides)  │
│                  │           │                  │           │ - OpenCV (Video) │
└──────────────────┘           └──────────────────┘           └──────────────────┘
```

---

## 🚀 CORE PLATFORM PIPELINES

Our solution integrates **five distinct pipelines** capable of scanning, cleansing, and moderating content across multiple file structures in real-time:

### 1. Real-Time Text Moderation
* **Direct Input Analysis:** Users input raw text into a live terminal interface.
* **NLP Intelligence:** Analyzes semantic meaning, context, toxicity, and sentiment using a layered combination of deep learning transformers.

### 2. Intelligent Image Moderation
* **NSFW Visual Scanner:** Screens uploaded images (supporting JPG, JPEG, PNG, GIF, WebP, BMP) for explicit content, violence, and suggestive themes.
* **Dual Ensemble Network:** Employs an ensemble max-pooling score derived from two parallel vision pipelines (`Falconsai` and `AdamCodd`) to achieve maximum detection accuracy.

### 3. Automated Video Moderation
* **Dynamic Key-Frame Extraction:** Uses OpenCV to automatically capture key-frames from uploaded videos (`.mp4`, `.avi`, `.mov`, `.webm`, `.mkv`) proportionate to the video duration.
* **Aggregated Frame Diagnostics:** Moderates frames individually and aggregates scores to generate a comprehensive visual safety index.

### 4. Enterprise Document Auditing
* **Universal Document Parser:** Extracts raw text programmatically from business documents (including PDF, DOCX, TXT, PPTX, and XLSX sheets).
* **Deep Content Categorization:** Subjects parsed texts to the 17-parameter text-analysis pipeline, outputting unified compliance scores.

### 5. Sanitized URL Scanning
* **HTML Crawling Engine:** Connects to any web page, crawls, and sanitizes live HTML structures.
* **Metadata & Body Segregation:** Strips scripts, style blocks, and non-readable assets. Scans critical text areas (such as Title, Meta-Description, and OpenGraph variables) for security and plagiarism audits.

---

## 🧠 THE 18 ADVANCED CLASSIFIERS

The system conducts multi-dimensional audits on every content item using **18 distinct analytical classifiers**:

| S.No | Classifier | Model / Architecture | Core Logic & Trigger Behavior |
| :--- | :--- | :--- | :--- |
| **1** | **Hate Speech** | `dehatebert-mono-english` & `ToxicBERT` | Flags racist, sexist, homophobic, or religious hate patterns. Cross-checked with target dictionaries to prevent evasion. |
| **2** | **Toxicity** | `toxic-bert` (Jigsaw) | Identifies verbal abuse, aggressive language, insults, and toxic commentary. |
| **3** | **Violence** | `toxic-bert` (threat) & Zero-Shot BART | Evaluates violent semantics, threats, and descriptions of physical harm. |
| **4** | **Misinformation** | Zero-Shot BART | Flags conspiracy theories, fake news, unverified health claims, and systemic hoaxes. |
| **5** | **Spam Detection** | Zero-Shot BART | Filters repetitive marketing pitches, unsolicited bot messages, and scam links. |
| **6** | **Self-Harm Alert** | Zero-Shot BART | Monitors references to suicide and self-harm, providing early safety intercepts. |
| **7** | **Cyberbullying** | `toxic-bert` (insult) | Targets cyberbullying, targeted harassment campaigns, and doxxing risks. |
| **8** | **Extremism** | Zero-Shot BART | Detects radicalization, extremist recruitment propaganda, and anti-societal triggers. |
| **9** | **Profanity** | `toxic-bert` (obscene) | Flags obscene language, swearing, and vulgar expressions. |
| **10** | **Sexual Content** | `NSFW_text_classifier` | Screens text blocks for explicit sexual context and erotica. |
| **11** | **Phishing & Scams** | Zero-Shot BART | Flags credential harvesting baits, fake bank verification scripts, and malicious financial links. |
| **12** | **Defamation** | Zero-Shot BART | Flags targeted character assassination, personal attacks, and libelous assertions. |
| **13** | **Hate Symbols** | Zero-Shot BART | Recognizes references to white supremacist codes, neo-nazi terms, and hate group iconography. |
| **14** | **Pseudoscience** | Zero-Shot BART | Identifies flat-earth models, anti-vaccine myths, and quack medicine remedies. |
| **15** | **Copyright Piracy** | Zero-Shot BART | Identifies unauthorized torrent links, direct file leaks, and license violations. |
| **16** | **NSFW Visuals** | Falconsai & AdamCodd (ViT Ensemble) | Detects graphic adult media, nudity, and explicit visual materials. |
| **17** | **Authenticity (AI)** | Zero-Shot BART | Audits text to determine if it is generated by a large language model (e.g., ChatGPT, Claude) or written by a human. |
| **18** | **Plagiarism** | Zero-Shot BART | Evaluates context and structure to check if text is creatively original or copied/scraped. |

---

## 💾 DATABASE SCHEMA & COMPLIANCE

The underlying data engine is governed by a relational SQLite model (`content_moderation.db`) engineered using SQLAlchemy:

```sql
-- Submissions Table
CREATE TABLE content_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_type VARCHAR(50) NOT NULL, -- 'text', 'image', 'video', 'url', 'document'
    content_text TEXT,
    file_path VARCHAR(500),
    file_name VARCHAR(500),
    created_at DATETIME,
    updated_at DATETIME
);

-- Results Table
CREATE TABLE moderation_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER,
    classifier_results JSON,
    overall_status VARCHAR(50) DEFAULT 'APPROVED', -- 'APPROVED', 'FLAGGED', 'NEEDS_REVIEW'
    violence_score FLOAT DEFAULT 0.0,
    adult_content_score FLOAT DEFAULT 0.0,
    hate_speech_score FLOAT DEFAULT 0.0,
    self_harm_score FLOAT DEFAULT 0.0,
    misinformation_score FLOAT DEFAULT 0.0,
    child_safety_score FLOAT DEFAULT 0.0,
    overall_risk_level VARCHAR(50) DEFAULT 'LOW',
    result_details JSON,
    moderated_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME
);

-- Reviews Table
CREATE TABLE manual_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER,
    reason TEXT,
    reviewer_id VARCHAR(100),
    review_decision VARCHAR(50),
    review_notes TEXT,
    confidence_override FLOAT,
    flagged_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME
);
```

---

## 💻 PREMIUM UX/UI EXPERIENCE

The frontend utilizes a state-of-the-art **Glassmorphic Design Language** to offer an engaging and intuitive user experience:

1. **Frosted-Glass Aesthetics:** Semi-transparent containers overlaying a sleek, dark tech-loop background video for a premium software look.
2. **Dynamic Dual Themes:** Supports seamless switching between high-contrast Light Mode and optimized Dark Mode.
3. **Immersive Customization:** Features **16 unique, gaming-inspired avatars** synced directly with local user sessions.
4. **Live Data Dashboard:** Aggregates statistics (Total Scans, Approved Items, Flagged Items, Approval/Risk Ratios) and presents them via real-time gauge meters and charts.
5. **Interactive Score Arcs:** The results page features smooth, color-coded arc indicators representing risk level ranges (`#ef4444` for High Risk, `#f59e0b` for Warning, and `#22c55e` for Safe).
6. **Detailed Explanation Insights:** Provides semantic context for decisions, rather than just displaying raw numbers (e.g., *"ToxicBERT flagged at 94% confidence. Trigger keywords: 'kill', 'murder'."*).
7. **JSON Personal Backup & PDF Export:**
   - **JSON Personal Data Backup:** Users can download their history profile and configurations with one click.
   - **Professional PDF Reports:** Converts active scorecard analyses into elegant, presentation-ready PDF summaries (`html2pdf.js`).
8. **Comprehensive Admin Portal:** Allows authorized administrators to create, read, update, and delete (CRUD) platform users and override system flags.

---

## 📡 STABLE API ROUTING

Built on FastAPI, the backend features highly optimized, asynchronous endpoints:

* `GET /` : Checks server status and API versions.
* `POST /moderate/text` : Processes direct text strings.
* `POST /moderate/image` : Screens media files.
* `POST /moderate/video` : Initiates video frame splitting and screening.
* `POST /moderate/document` : Audits PDF, DOCX, TXT, PPTX, and XLSX sheets.
* `POST /moderate/url` : Scrapes, cleans, and runs compliance checks on websites.
* `GET /results/{submission_id}` : Retrieves detailed historical results.
* `GET /submissions` : Returns paginated scan history.
* `GET /stats` : Gathers overall operational statistics.
* `POST /moderate/review/{submission_id}` : Handles human-in-the-loop decisions (approve/flag overrides).
