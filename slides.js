document.addEventListener('DOMContentLoaded', function() {
    // Find all code blocks and highlight lines with special markers
    document.querySelectorAll('pre code').forEach(function(codeBlock) {
      // Look for spans with class "co" containing #<<
      const spans = codeBlock.querySelectorAll('span.co');
      spans.forEach(function(span) {
        if (span.textContent.includes('#<<')) {
          // Find the parent line span and highlight it
          const lineSpan = span.closest('span[id^="cb"]');
          if (lineSpan) {
            lineSpan.classList.add('code-highlight');
            // Remove the marker span
            span.remove();
          }
        }
      });
    });
  });

// FIXME: Remove once the Quarto that renders this deck keeps off-screen slides
// out of the tab order itself (quarto-dev/quarto-cli#14795; reveal.js 6.0.2
// does, hakimel/reveal.js#1587). Quarto fixed it for 1.11 in
// quarto-dev/quarto-cli#15010, which no release has yet: 1.10.19, the newest,
// does not. The reveal.js 5.1.0 that Quarto bundles marks
// them `hidden`, but still displays the ones within viewDistance, and
// slides.css displays every slide, so the charts on all the other slides stay
// in the tab order. This is reveal.js 6.0.2's rule: every slide but the
// current one and the stack holding it is inert, except in the overview,
// scroll and print views, where all slides are on screen.
(function() {
  function updateInertSlides() {
    if (!window.Reveal || !Reveal.isReady()) return;
    const currentSlide = Reveal.getCurrentSlide();
    const allowAllSlides = Reveal.isOverview() || Reveal.isScrollView() || Reveal.isPrintView();
    Reveal.getRevealElement().querySelectorAll('.slides section').forEach(function(slide) {
      slide.toggleAttribute('inert', !allowAllSlides && slide !== currentSlide && !slide.contains(currentSlide));
    });
  }
  // Capture phase on the document, so slides are updated before any listener
  // on the deck runs, as reveal.js 6 does.
  ['ready', 'slidechanged', 'overviewshown', 'overviewhidden'].forEach(function(type) {
    document.addEventListener(type, updateInertSlides, true);
  });
  // Entering or leaving the scroll view (the R key, or a window narrower than
  // scrollActivationWidth) dispatches no event of its own, but reveal.js
  // marks it with a class on the viewport.
  document.addEventListener('ready', function() {
    new MutationObserver(updateInertSlides)
      .observe(Reveal.getViewportElement(), { attributes: true, attributeFilter: ['class'] });
  }, true);
})();

// Give the deck itself the focus, so that a screen reader passes the arrow keys
// on to reveal.js. reveal.js gives the deck role="application", and NVDA hands
// the keys to the page only while the focused element is that application
// itself. On anything inside it (a link, the menu button, a slide) it stays in
// browse mode, where the arrows read the page and only Space reaches
// reveal.js. So the deck:
// - takes the focus when the page opens, and from a click;
// - is a Tab stop, so that Shift+Tab from a chart or a link comes back to it;
// - takes the focus back from a slide: from the one maidr gives it to after
//   Shift+Tab out of a chart, and from the one left behind, which is made
//   inert and would drop it to the body.
// It is named, as an application must be. Slides are made inert by the rule
// above and by Quarto itself from 1.11, so this stays after that rule goes.
(function() {
  let lastFocused = null;
  function focusDeck() {
    Reveal.getRevealElement().focus({ preventScroll: true });
  }
  document.addEventListener('focusin', function(event) {
    lastFocused = event.target;
    // Once maidr has seen the slide take the focus, which it checks at once.
    if (event.target instanceof Element && event.target.matches('.reveal .slides section')) {
      setTimeout(function() {
        if (document.activeElement === event.target) focusDeck();
      });
    }
  });
  function keepFocusInDeck() {
    const deck = Reveal.getRevealElement();
    const active = document.activeElement;
    const focused = active && active !== document.body ? active : lastFocused;
    if (focused && focused !== deck && deck.contains(focused) && focused.closest('.slides section[inert]')) {
      focusDeck();
    }
  }
  document.addEventListener('ready', function() {
    const deck = Reveal.getRevealElement();
    deck.setAttribute('tabindex', '0');
    deck.setAttribute('aria-label', 'Slides');
    if (!document.activeElement || document.activeElement === document.body) focusDeck();
  }, true);
  // Bubbling, so it runs once the slides have been made inert.
  ['slidechanged', 'overviewhidden'].forEach(function(type) {
    document.addEventListener(type, keepFocusInDeck);
  });
})();

// FIXME: Remove once the Quarto that renders this deck names the slide menu's
// button itself (quarto-dev/quarto-cli#14249, open; quarto-dev/quarto-cli#14251
// would fix it). The button is a link with an icon and no text, so a screen
// reader reads the first Tab stop on most slides as an unnamed link.
document.addEventListener('menu-ready', function() {
  const link = document.querySelector('.slide-menu-button a');
  if (link && !link.hasAttribute('aria-label')) link.setAttribute('aria-label', 'Slide menu');
});

// FIXME: Remove once the Quarto that renders this deck keeps the closed slide
// menu out of the tab order itself (quarto-dev/quarto-cli#15011, fixed for
// 1.11 in quarto-dev/quarto-cli#15016, which no release has yet). The menu
// plugin closes the menu by moving it off screen, so screen readers still
// read its list of slides, and since this deck's list is long enough to
// scroll, Chrome and Firefox make it a Tab stop that cannot be seen. This is
// Quarto's fix: the menu is inert whenever it is not open.
document.addEventListener('menu-ready', function() {
  const menu = document.querySelector('.slide-menu');
  if (!menu) return;
  function updateInertMenu() {
    menu.toggleAttribute('inert', !menu.classList.contains('active'));
  }
  updateInertMenu();
  new MutationObserver(updateInertMenu)
    .observe(menu, { attributes: true, attributeFilter: ['class'] });
});
