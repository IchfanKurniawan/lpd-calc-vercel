---
name: LPD Calculator
description: GBC Indonesia identity adapted to a lighting calculation workspace
colors:
  evergreen: "#354f45"
  action-green: "#397c42"
  brand-green: "#5fb25c"
  pale-green: "#d8f1dd"
  canvas: "#f6f8f4"
  text: "#263a30"
  white: "#ffffff"
typography:
  heading:
    fontFamily: "Parkinsans, Onest, system-ui, sans-serif"
    fontSize: "clamp(25px, 2.5vw, 34px)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Onest, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: "10px"
  panel: "16px"
spacing:
  small: "8px"
  medium: "16px"
  large: "36px"
components:
  button-primary:
    backgroundColor: "{colors.action-green}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
---

# Design System: LPD Calculator

## Overview

The UI adapts the [current GBC Indonesia site](https://gbcindonesia.org/) for a calculation workspace. The public site uses an evergreen masthead, green action color, pale green surfaces, Onest body text, and Parkinsans headings. The site logo is stored locally at `public/gbci-logo.webp` to avoid a runtime dependency on its image URL.

## Colors

| Role | Value | Use |
| --- | --- | --- |
| Evergreen | `#354f45` | Sidebar, headings, footer |
| Action green | `#397c42` | Primary actions and numbered labels |
| Brand green | `#5fb25c` | Accent lines and progress indicator |
| Pale green | `#d8f1dd` | Soft accents |
| Canvas | `#f6f8f4` | Workspace background |
| Dark text | `#263a30` | Main text |
| Onest | Google Fonts | Body and controls |
| Parkinsans | Google Fonts | Page and section headings |

## Typography

Parkinsans is used for headings and Onest for controls, tables, and body text. Numeric values use tabular figures.

## Layout

Desktop has a 250px sidebar and workspace up to 1440px wide. The sidebar becomes a drawer at tablet widths. On narrow screens the lamp table scrolls and rooms become cards.

## Elevation & Depth

Tone and borders separate the workspace. Overlays retain soft shadows; the main section panel has no shadow.

## Shapes

Controls use 10px corners and panels use 16px corners.

## Components

- Treat this as an operating tool: compact controls, clear table headers, and visible numeric units.
- Keep the three calculator stages visible above the work area; retain sidebar navigation on desktop.
- Show the SNI reference as context, without claiming the app certifies a building.
- Use dark green for primary actions with white text, brighter green for nontext accents, and amber only for over-baseline results.
- Keep focus states visible and retain a scrollable table on narrow screens.
- Preserve all sections in the print layout.

The visual reference was inspected on 3 November 2026. Brand assets and site styling may change later.
