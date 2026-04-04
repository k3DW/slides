// Hides lines in lockstep with `data-line-numbers` stepping
//
// Usage:
//   * Add `data-line-hide="..."` to a <code> element that has `data-line-numbers="..."`
//   * Same exact syntax as `data-line-numbers`
//   * Must have the same number of pipe-separated segments as the associated
//     `data-line-numbers`, otherwise the behaviour is undefined
//
// Example:
//   ```cpp
//   for (int i = 0; i < 5; ++i) {
//     int square = i * i;
//     std::cout << square << "\n";
//   }
//   ```
//
//   ```
//   data-line-numbers="   |1,4|2|3|"
//   data-line-hide=   "1-4|2-3|3| |"
//   ```
//
//   * In the first segment, all the code is hidden
//   * Next, lines 1 and 4 are shown, and are highlighted
//   * Next, line 2 is also shown, and is highlighted, with lines 1 and 4 unhighlighted
//   * Next, line 3 is also shown, and is highlighted, with lines 1, 2, and 4 unhighlighted
//   * Finally, all the lines are shown, and highlighting is disabled

let RevealCodeLineHide = (() => {

  function parseLineSpec(spec) {
    let s = new Set();
    if (!spec) {
      return s;
    }
    spec.split(',').forEach(part => {
      const t = part.trim();
      if (!t) {
        return;
      }
      const dash = t.indexOf('-');
      let a, b;
      if (dash === -1) {
        a = b = parseInt(t, 10);
      } else {
        a = parseInt(t.slice(0, dash), 10);
        b = parseInt(t.slice(dash + 1), 10);
      }
      if (isNaN(a) || isNaN(b)) {
        return;
      }
      for (let i = a; i <= b; i++) {
        s.add(i);
      }
    });
    return s;
  }

  function hideRow(tr) {
    tr.querySelectorAll('td:not(.hljs-ln-numbers)').forEach(td => {
      td.style.setProperty('color',   'transparent', 'important');
      td.style.setProperty('opacity', '0',           'important');
      td.querySelectorAll('div, span').forEach(el => {
        el.style.setProperty('opacity', '0', 'important');
      });
    });
  }

  function applyHideToCode(code, stepIndex) {
    const raw = code.getAttribute('data-line-hide');
    if (!raw) {
      return;
    }
    const spec = raw.split('|')[stepIndex] || '';
    code.setAttribute('data-line-hide', spec.trim());
    const hidden = parseLineSpec(spec);
    if (hidden.size == 0) {
      return;
    }
    code.classList.add('has-highlights');
    code.querySelectorAll('table tr').forEach((tr, i) => {
      if (hidden.has(i + 1)) {
        hideRow(tr);
      }
    });
  }

  // The structure inside <pre>, after the processing done with `data-line-numbers`:
  //   ```html
  //   <pre>
  //     <code ...>
  //     <code data-fragment-index="0" ...>
  //     <code data-fragment-index="1" ...>
  //     ...
  //   </pre>
  //   ```
  // Each <code> needs its own hide spec applied. Note that these <code>
  // elements are neither 0-indexed or 1-indexed on the `data-fragment-index`.
  // The first element has no `data-fragment-index` at all, then it starts at 0.
  function applyHideToPre(pre) {
    pre.querySelectorAll('code[data-line-hide]').forEach(code => {
      const idx = code.getAttribute('data-fragment-index');
      const stepIndex = (idx === null || idx === '') ? 0 : parseInt(idx, 10) + 1;
      applyHideToCode(code, stepIndex);
    });
  }

  function syncCurrentSlide(deck) {
    deck.getCurrentSlide()?.querySelectorAll('pre').forEach(applyHideToPre);
  }

  return {
    id: 'line-hide',
    init: deck => {
      deck.on('ready',        () => syncCurrentSlide(deck));
      deck.on('slidechanged', () => syncCurrentSlide(deck));
    },
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RevealCodeLineHide;
}
