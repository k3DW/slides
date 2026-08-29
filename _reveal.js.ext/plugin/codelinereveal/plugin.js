// Expands `data-line-reveal` into `data-line-numbers` + `data-line-hide`
// before RevealJS's `highlight` plugin processes the code block.
//
// Usage:
//   ```
//   data-line-reveal="1-2 | 3-4 | 5-8+10-11 | 10-11 | 12-13"
//   ```
//
// This is equivalent to:
//   ```
//   data-line-numbers="1-2 |3-4 |5-8  |10-11|12-13"
//   data-line-hide=   "3-13|5-13|12-13|12-13|     "
//   ```
//
// Each step is `<highlight-ranges>` optionally followed by `+<extra-ranges>`.
// `highlight-ranges` becomes that step's `data-line-numbers` entry.
// `extra-ranges` are lines revealed at this step WITHOUT being highlighted
// (e.g. context that appears early but isn't the focus yet).
// Once a line is revealed, it stays revealed for all later steps.
//
// Must run BEFORE the `highlight` plugin in the `plugins: [...]` array,
// since it mutates `data-line-numbers`/`data-line-hide`, which `highlight`
// then clones per step.

let RevealCodeLineReveal = (() => {

  function parseLineSpec(spec) {
    let s = new Set();
    if (!spec) return s;
    spec.split(',').forEach(part => {
      const t = part.trim();
      if (!t) return;
      const dash = t.indexOf('-');
      let a, b;
      if (dash === -1) { a = b = parseInt(t, 10); }
      else { a = parseInt(t.slice(0, dash), 10); b = parseInt(t.slice(dash + 1), 10); }
      if (isNaN(a) || isNaN(b)) return;
      for (let i = a; i <= b; i++) s.add(i);
    });
    return s;
  }

  function collapseToRangeSpec(set) {
    const sorted = [...set].sort((a, b) => a - b);
    const ranges = [];
    let start = null, prev = null;
    for (const n of sorted) {
      if (start === null) { start = n; }
      else if (n !== prev + 1) {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
        start = n;
      }
      prev = n;
    }
    if (start !== null) ranges.push(start === prev ? `${start}` : `${start}-${prev}`);
    return ranges.join(',');
  }

  function countLines(code) {
    // Assumes the same line-counting convention as your build already
    // uses for hand-written data-line-hide specs. If your template
    // trims a leading/trailing blank line, mirror that here — or
    // override explicitly with data-line-total="N" on the <code> tag.
    const override = code.getAttribute('data-line-total');
    if (override) return parseInt(override, 10);
    return code.textContent.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n').length;
  }

  function expandCode(code) {
    const raw = code.getAttribute('data-line-reveal');
    if (!raw) return;

    const total = countLines(code);
    const allLines = new Set(Array.from({ length: total }, (_, i) => i + 1));
    const steps = raw.split('|').map(s => s.trim());

    const revealed = new Set();
    const numbersSteps = [];
    const hideSteps = [];

    steps.forEach(step => {
      const [highlightPart, extraPart] = step.split('+');
      const highlightSet = parseLineSpec((highlightPart || '').trim());
      const extraSet = parseLineSpec((extraPart || '').trim());

      highlightSet.forEach(n => revealed.add(n));
      extraSet.forEach(n => revealed.add(n));

      const hiddenSet = new Set([...allLines].filter(n => !revealed.has(n)));

      numbersSteps.push(collapseToRangeSpec(highlightSet));
      hideSteps.push(collapseToRangeSpec(hiddenSet));
    });

    code.setAttribute('data-line-numbers', numbersSteps.join('|'));
    code.setAttribute('data-line-hide', hideSteps.join('|'));
    code.removeAttribute('data-line-reveal');
  }

  function expandSlide(slide) {
    slide.querySelectorAll('code[data-line-reveal]').forEach(expandCode);
  }

  return {
    id: 'line-reveal',
    init: deck => {
      // Run once, synchronously, on ALL slides — must complete before
      // the `highlight` plugin's own init runs.
      deck.getSlides().forEach(expandSlide);
    },
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RevealCodeLineReveal;
}
