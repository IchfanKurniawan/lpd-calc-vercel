# LPD Calculator

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Building project teams preparing room-by-room lighting power density calculations for GREENSHIP New Building 1.3. This is inferred from `documentation.md` and the existing workflow; no separate audience interview was conducted.

## Product Purpose

Record lamp types and room lighting assignments, then compare the design lighting power density with the embedded SNI reference. Show the area-weighted baseline, design LPD, and percentage reduction without making a GREENSHIP score claim.

## Operating Context

Users enter lamp specifications, then room typology, room type, area, and lamp counts. The calculator updates results immediately. Data stays in browser local storage; users can import and export JSON.

## Capabilities and Constraints

- React 18 and Vite 8 static application with no backend, English-only interface.
- One calculation set per browser session, with unlimited lamp slots per room.
- Rooms need a name, typology, room type, area, and at least one lighting system. Results stay hidden until every row is complete.
- Deleting a lighting system that is in use requires explicit confirmation.
- Existing calculation formulas and embedded SNI values are preserved. The SNI data was supplied with the project and has not been independently checked against the standard publication.
- JSON is the only import/export format. CSV and bilingual features are out of scope.
- Netlify and Vercel configurations are both maintained. Publishing is a separate step.

## Brand Commitments

The user requested that the interface reflect the current visual identity of [GBC Indonesia](https://gbcindonesia.org/). The application remains named LPD Calculator, with GREENSHIP New Building 1.3 context.

## Evidence on Hand

- `documentation.md` describes the calculator workflow, formulas, data model, and original design.
- `DESIGN.md` records the current GBC-derived palette, type scale, and layout.
- `src/data/sniDatabase.js` contains the embedded LPD reference values.
- The current GBC Indonesia site supplies the visual reference and logo asset.

## Product Principles

1. Make the lamp → room → result sequence clear.
2. Keep numeric inputs and comparison results easy to scan.
3. Preserve data relationships through import, deletion, and export.
4. Never present a partial calculation as a complete one.
5. Distinguish calculated reduction from certification scoring.
