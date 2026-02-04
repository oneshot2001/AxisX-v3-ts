# Product Mission

> Last Updated: 2026-02-04
> Version: 1.0.0

## Pitch

AxisX is a camera cross-reference tool that helps Axis Communications sales professionals instantly find replacement Axis cameras for competitor models, enabling NDAA compliance migrations and competitive takeouts with accurate URLs, pricing, and technical specifications.

## Users

### Primary Customers

- **Regional Sales Managers (RSMs)**: Field sales staff who need quick lookups during customer meetings
- **Security Integrators**: Installation partners recommending Axis replacements for existing competitor systems

### User Personas

**Field RSM** (30-50 years old)
- **Role:** Axis Communications Regional Sales Manager
- **Context:** On-site with customers, often viewing competitor cameras in the field
- **Pain Points:** Remembering exact model numbers from photos, finding accurate product URLs, manual price lookups
- **Goals:** Close deals faster, provide accurate recommendations, demonstrate NDAA compliance expertise

**Security Integrator** (25-45 years old)
- **Role:** System designer at an integration partner
- **Context:** Building proposals for camera system upgrades or replacements
- **Pain Points:** Creating accurate BOMs, tracking NDAA-compliant alternatives, managing multiple manufacturer catalogs
- **Goals:** Generate professional proposals quickly, ensure compliance, maximize project margins

## The Problem

### Competitor Camera Identification

Sales reps encounter competitor cameras in the field and need instant Axis recommendations. Currently this requires manual catalog searches, memorized mappings, or calls back to the office.

**Our Solution:** Voice-first search with fuzzy matching handles typos from quickly-read model numbers and returns categorized Axis alternatives.

### NDAA Section 889 Compliance

Government contracts ban Hikvision, Dahua, and Uniview cameras. Customers need to identify and replace banned equipment quickly.

**Our Solution:** Automatic NDAA category flagging shows which competitor brands are banned and provides compliant Axis replacements.

### Unreliable Product URLs

Axis product pages have complex URLs with regional variants, frequency suffixes, and lens options. Guessing URLs often fails.

**Our Solution:** Four-step URL resolution cascade with verified URLs, alias handling, variant stripping, and search fallback ensures 100% link accuracy.

### Legacy Axis Upgrades

Customers with discontinued Axis cameras need upgrade paths to current models.

**Our Solution:** Legacy→Current mapping database with direct replacements and upgrade recommendations.

## Differentiators

### Voice-First Field Design

Unlike traditional catalog tools designed for desktop use, AxisX is built for voice input on mobile devices. Sales reps can speak model numbers while looking at competitor cameras, and fuzzy matching handles the inevitable transcription errors.

### Integrated NDAA Compliance

Unlike generic cross-reference tools, AxisX automatically categorizes competitors by NDAA status, helping sales reps position Axis as the compliant alternative for government accounts.

### Guaranteed URL Accuracy

Unlike tools that construct URLs from templates (which break with Axis's complex naming), AxisX uses a verified URL database with intelligent fallbacks, ensuring every link works.

## Key Features

### Core Features

- **Intelligent Search:** Fuzzy matching with Levenshtein distance handles typos, voice transcription errors, and partial model numbers
- **Query Type Detection:** Automatically identifies competitor models, legacy Axis cameras, and manufacturer searches
- **URL Resolution Cascade:** Four-step system ensures accurate product links every time
- **MSRP Lookup:** Instant pricing for BOM creation

### Compliance Features

- **NDAA Categorization:** Competitor brands automatically flagged as Section 889 banned, cloud-based, Korean, Japanese, or Motorola-family
- **Compliance Filtering:** Filter search results by NDAA status for government accounts

### Workflow Features

- **Voice Input:** Web Speech API integration for hands-free model entry
- **BOM Cart:** Build and export camera lists with quantities and pricing
- **PDF/CSV Export:** Generate professional proposals and equipment lists

### Data Features

- **Competitor Mappings:** Comprehensive database of competitor→Axis recommendations
- **Legacy Database:** Discontinued Axis models mapped to current replacements
- **Price Data:** Current MSRP lookup for all Axis models
