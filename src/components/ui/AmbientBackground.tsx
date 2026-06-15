// Subtle ambient background: a few soft, slow, blurred blobs in pale blue/mint
// tones. Fixed behind all content (pointer-events-none, negative z-index) and
// only visible in the empty slate gaps between white cards. Animation respects
// prefers-reduced-motion via the .ambient-blob CSS in globals.css.

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="ambient-blob ambient-blob-1" />
      <div className="ambient-blob ambient-blob-2" />
      <div className="ambient-blob ambient-blob-3" />
    </div>
  );
}
