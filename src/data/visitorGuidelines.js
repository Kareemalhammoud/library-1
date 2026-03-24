/**
 * Visitor guidelines for our libraries.
 * Extracted for reuse across pages (e.g. Visit, Services, FAQ).
 *
 * Each entry includes:
 *   title   – short heading
 *   body    – one-to-two sentence description
 *   icon    – SVG path data (24×24 viewBox, stroke-based)
 */

export const VISITOR_GUIDELINES = [
  {
    title: 'Bring Your ID',
    body: 'A valid LAU ID or government-issued ID is required for entry. External visitors may request a guest pass at the circulation desk.',
    icon: [
      { tag: 'rect', attrs: { x: 4, y: 2, width: 16, height: 20, rx: 2 } },
      { tag: 'circle', attrs: { cx: 12, cy: 9, r: 2.5 } },
      { tag: 'path', attrs: { d: 'M8 17h8' } },
    ],
  },
  {
    title: 'Respect Quiet Zones',
    body: 'Keep phones on silent and conversations to a minimum in designated quiet areas. Use group rooms for discussions.',
    icon: [
      { tag: 'path', attrs: { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', strokeLinejoin: 'round' } },
      { tag: 'path', attrs: { d: 'M13.73 21a2 2 0 0 1-3.46 0' } },
      { tag: 'line', attrs: { x1: 4, y1: 4, x2: 20, y2: 20 } },
    ],
  },
  {
    title: 'Share Spaces Considerately',
    body: 'Keep shared desks and study areas tidy. Food and uncovered drinks are not permitted in reading areas.',
    icon: [
      { tag: 'path', attrs: { d: 'M17 20c0-2.21-2.239-4-5-4s-5 1.79-5 4' } },
      { tag: 'circle', attrs: { cx: 12, cy: 8, r: 3 } },
      { tag: 'path', attrs: { d: 'M23 20c0-1.863-1.571-3.45-3.75-3.875' } },
      { tag: 'path', attrs: { d: 'M18 6.25A3 3 0 0 1 18 12' } },
    ],
  },
  {
    title: 'Entry & Exit',
    body: 'Do not leave personal belongings unattended. Bags may be checked at entry and exit for security purposes.',
    icon: [
      { tag: 'path', attrs: { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' } },
      { tag: 'path', attrs: { d: 'M16 17l5-5-5-5', strokeLinejoin: 'round' } },
      { tag: 'path', attrs: { d: 'M21 12H9' } },
    ],
  },
]
