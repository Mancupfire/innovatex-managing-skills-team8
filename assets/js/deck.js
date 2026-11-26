/* Presentation renderer and controls. Slide text lives in content/, not here. */
(function () {
  "use strict";

  var Deck = window.Deck;
  var cfg = Deck.config || { title: "Presentation", subtitle: "", slides: [] };
  var CANVAS_W = 1600, CANVAS_H = 900;

  var $ = function (id) { return document.getElementById(id); };
  var stage = $("stage");
  var state = { index: 0, slides: [], notesOpen: false, tocOpen: false, total: 0 };

  /* ---------- 1. Load slide files in order ---------- */

  window.addEventListener("error", function (e) {
    if (e && e.filename && /content\//.test(e.filename)) {
      var file = e.filename.replace(/^.*?(content\/)/, "$1");
      Deck.errors.push(file + " line " + e.lineno + ": " + e.message);
    }
  });

  function loadSlides(files, done) {
    var remaining = files.length;
    if (!remaining) { done(); return; }
    files.forEach(function (name) {
      var s = document.createElement("script");
      s.src = "content/slides/" + name;
      s.async = false; // keep presentation order
      s.onload = s.onerror = function (ev) {
        if (ev.type === "error") Deck.errors.push("content/slides/" + name + " could not be loaded (check the file name in content/deck.js).");
        if (--remaining === 0) done();
      };
      document.head.appendChild(s);
    });
  }

  /* ---------- 2. Helpers ---------- */

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  // Escapes text, then turns **bold** into <strong>.
  function fmt(str) {
    return esc(str).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function isFinal(s) { return s.status === "final"; }

  /* ---------- 3. Blocks ---------- */

  var renderers = {
    cards: function (b) {
      var wrap = el("div", "block block-cards cols-" + (b.items || []).length);
      if (b.widths) wrap.style.setProperty("--card-cols", b.widths.join(" "));
      (b.items || []).forEach(function (item, i) {
        var card = el("article", "card");
        var head = "";
        if (b.numbered) head += '<span class="card-num" aria-hidden="true">' + (i + 1) + "</span>";
        head += "<h3>" + fmt(item.heading) + "</h3>";
        card.appendChild(el("div", "card-head", head));
        if (item.text) card.appendChild(el("p", "card-text", fmt(item.text)));
        if (item.points && item.points.length) {
          card.appendChild(el("ul", "points", item.points.map(function (p) { return "<li>" + fmt(p) + "</li>"; }).join("")));
        }
        wrap.appendChild(card);
      });
      return wrap;
    },
    bullets: function (b) {
      var wrap = el("div", "block block-bullets");
      if (b.heading) wrap.appendChild(el("h3", "block-heading", fmt(b.heading)));
      wrap.appendChild(el("ul", "points points-lg", (b.items || []).map(function (p) { return "<li>" + fmt(p) + "</li>"; }).join("")));
      return wrap;
    },
    text: function (b) {
      return el("p", "block block-text", fmt(b.text));
    },
    callout: function (b) {
      return el("div", "block block-callout", "<p>" + (b.label ? '<strong class="callout-label">' + fmt(b.label) + ":</strong> " : "") + fmt(b.text) + "</p>");
    },
    table: function (b) {
      var wrap = el("div", "block block-table");
      var cols = b.columns || [];
      var html = "<table>";
      if (b.caption) html += '<caption class="sr-only">' + esc(b.caption) + "</caption>";
      if (b.widths) html += "<colgroup>" + b.widths.map(function (w) { return '<col style="width:' + esc(w) + '">'; }).join("") + "</colgroup>";
      html += "<thead><tr>" + cols.map(function (c) { return '<th scope="col">' + fmt(c) + "</th>"; }).join("") + "</tr></thead><tbody>";
      (b.rows || []).forEach(function (r) {
        html += "<tr>" + r.map(function (c, i) {
          var label = ' data-label="' + esc(cols[i] || "") + '"';
          return i === 0 ? '<th scope="row"' + label + ">" + fmt(c) + "</th>" : "<td" + label + ">" + fmt(c) + "</td>";
        }).join("") + "</tr>";
      });
      html += "</tbody></table>";
      wrap.innerHTML = html;
      return wrap;
    },
    decision: function (b) {
      var wrap = el("div", "block block-decision");
      var head = '<div class="decision-head"><strong>' + fmt(b.label || "Decision rule") + "</strong>";
      if (b.tag) head += '<span class="tag">' + fmt(b.tag) + "</span>";
      head += "</div>";
      wrap.appendChild(el("div", "", head));
      var list = el("ul", "decision-list");
      (b.options || []).forEach(function (o, i) {
        list.appendChild(el("li", "decision-opt opt-" + (i + 1),
          '<span class="verdict"><span class="verdict-sym" aria-hidden="true">' + esc(o.symbol || "") + "</span>" + fmt(o.verdict) + "</span> " +
          '<span class="verdict-text">' + fmt(o.text) + "</span>"));
      });
      wrap.appendChild(list);
      return wrap;
    },
    example: function (b, slide) {
      var wrap = el("div", "block block-example");
      wrap.setAttribute("data-interactive", "");
      var screen = el("div", "example-screen");
      screen.innerHTML =
        '<span class="tag tag-example">' + fmt(b.badge || "Illustrative example") + "</span>" +
        '<span class="example-code">' + fmt(b.code) + "</span>";
      var btn = el("button", "btn-primary", fmt(b.button || "Follow one idea") + ' <span aria-hidden="true">→</span>');
      btn.type = "button";
      btn.setAttribute("aria-haspopup", "dialog");
      btn.addEventListener("click", function () { openExample(b, btn); });
      screen.appendChild(btn);
      wrap.appendChild(screen);
      wrap.appendChild(el("p", "example-print", fmt(b.printLine)));
      return wrap;
    },
    row: function (b, slide) {
      var wrap = el("div", "block block-row");
      (b.blocks || []).forEach(function (child) { wrap.appendChild(renderBlock(child, slide)); });
      return wrap;
    }
  };

  function renderBlock(b, slide) {
    var r = renderers[b && b.type];
    if (!r) return el("p", "block block-error", "Unknown block type “" + esc(b && b.type) + "” in " + esc(slide._file));
    return r(b, slide);
  }

  /* ---------- 4. Slides ---------- */

  function placeholder(s) {
    var box = el("div", "placeholder");
    var html = '<p class="placeholder-status">Awaiting ' + esc(s.owner) + "’s content</p>";
    html += '<p class="placeholder-topic">' + esc(s.topic) + " · owner: " + esc(s.owner) + "</p>";
    if (s.brief) html += '<p class="placeholder-brief"><strong>Scenario from the team brief:</strong> ' + fmt(s.brief) + "</p>";
    html += '<p class="placeholder-file">Edit <code>' + esc(s._file) + "</code></p>";
    box.innerHTML = html;
    return box;
  }

  function buildSlide(s, i, total) {
    var num = pad(s.number);
    var sec = el("section", "slide" + (s.layout === "opening" ? " slide-opening" : "") + (isFinal(s) ? "" : " is-draft"));
    sec.id = "slide-" + num;
    sec.setAttribute("aria-roledescription", "slide");
    sec.setAttribute("aria-label", "Slide " + s.number + " of " + total + ": " + (s.title || s.topic));

    var head = el("header", "slide-head");
    if (s.layout === "opening") {
      head.appendChild(el("h1", "deck-title", fmt(cfg.title)));
      head.appendChild(el("p", "deck-subtitle", fmt(cfg.subtitle)));
      var hasOwn = (s.blocks && s.blocks.length) || isFinal(s);
      head.appendChild(el("p", "kicker", '<span class="kicker-num">' + num + "</span>" + esc(s.topic)));
      if (hasOwn && s.title) head.appendChild(el("h2", "slide-title", fmt(s.title)));
    } else {
      head.appendChild(el("p", "kicker", '<span class="kicker-num">' + num + "</span>" + esc(s.topic)));
      head.appendChild(el("h2", "slide-title", fmt(s.title || s.topic)));
    }
    if (s.lead) head.appendChild(el("p", "lead", fmt(s.lead)));
    sec.appendChild(head);

    var body = el("div", "slide-body");
    if (s.blocks && s.blocks.length) {
      s.blocks.forEach(function (b) { body.appendChild(renderBlock(b, s)); });
    } else if (!isFinal(s)) {
      body.appendChild(placeholder(s));
    }
    sec.appendChild(body);

    var foot = el("footer", "slide-foot");
    var src = "";
    if (s.sources && s.sources.length) {
      src += s.sources.map(function (x, k) {
        return '<p class="source">' + (k === 0 ? "<strong>Sources:</strong> " : "") + fmt(x.text) +
          (x.url ? ' <a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.url.replace(/^https?:\/\/(www\.)?/, "")) + "</a>" : "") + "</p>";
      }).join("");
    }
    if (s.footnote) src += '<p class="footnote">' + fmt(s.footnote) + "</p>";
    foot.appendChild(el("div", "foot-left", src));
    foot.appendChild(el("div", "foot-right",
      '<span class="foot-deck">' + esc(cfg.shortTitle || "") + "</span>" +
      '<span class="foot-owner">' + esc(s.owner) + "</span>" +
      '<span class="foot-num">' + num + " / " + pad(total) + "</span>"));
    sec.appendChild(foot);

    sec.appendChild(el("span", "draft-stamp", isFinal(s) ? "Draft deck" : "Draft · awaiting content"));
    return sec;
  }

  function errorSlide(n, total, msgs) {
    var sec = el("section", "slide is-draft slide-error");
    sec.id = "slide-" + pad(n);
    sec.setAttribute("aria-roledescription", "slide");
    sec.innerHTML = '<header class="slide-head"><p class="kicker"><span class="kicker-num">' + pad(n) + '</span>Content error</p>' +
      '<h2 class="slide-title">This slide’s file has an error</h2></header>' +
      '<div class="slide-body"><div class="placeholder"><p class="placeholder-status">Fix the file, then reload</p>' +
      msgs.map(function (m) { return '<p class="placeholder-file"><code>' + esc(m) + "</code></p>"; }).join("") +
      '<p class="placeholder-topic">Usually a missing comma, quote or bracket. Compare with another slide file.</p></div></div>';
    return sec;
  }

  /* ---------- 5. Navigation ---------- */

  function slideFromHash() {
    var m = /^#slide-(\d{1,2})$/.exec(location.hash);
    if (!m) return null;
    var n = parseInt(m[1], 10);
    return n >= 1 && n <= state.total ? n - 1 : null;
  }

  function go(i, opts) {
    opts = opts || {};
    i = Math.max(0, Math.min(state.total - 1, i));
    var changed = i !== state.index;
    state.slides.forEach(function (s, k) {
      var on = k === i;
      s.hidden = !on;
      s.classList.toggle("is-active", on);
    });
    state.index = i;
    var hash = "#slide-" + pad(i + 1);
    if (location.hash !== hash) history.replaceState(null, "", hash);
    $("counter").textContent = pad(i + 1) + " / " + pad(state.total);
    $("btn-prev").disabled = i === 0;
    $("btn-next").disabled = i === state.total - 1;
    updateNotes();
    updateToc();
    if (changed || opts.announce) {
      var s = state.data[i];
      $("announcer").textContent = "Slide " + (i + 1) + " of " + state.total + ": " + (s ? (s.title || s.topic) : "");
      if (isMobile()) window.scrollTo(0, 0);
    }
  }
  function next() { go(state.index + 1); }
  function prev() { go(state.index - 1); }

  function isMobile() { return window.matchMedia("(max-width: 760px)").matches; }

  /* ---------- 6. Scaling ---------- */

  function fit() {
    if (isMobile()) { stage.style.transform = ""; stage.style.width = ""; stage.style.height = ""; return; }
    var vp = $("deck");
    var w = vp.clientWidth, h = vp.clientHeight;
    var pad = document.fullscreenElement ? 0 : 16;
    var scale = Math.min((w - pad * 2) / CANVAS_W, (h - pad * 2) / CANVAS_H);
    stage.style.transform = "scale(" + scale + ")";
  }

  /* ---------- 7. Notes ---------- */

  function updateNotes() {
    var s = state.data[state.index];
    if (!s) return;
    var body = $("notes-body"), meta = $("notes-meta");
    var text = (s.notes || "").trim();
    if (text) {
      var words = text.split(/\s+/).length;
      meta.textContent = "Slide " + pad(s.number) + " · " + s.owner + " · " + words + " words · about " + Math.round(words / 120 * 60) + " s";
      body.innerHTML = text.split(/\n\s*\n/).map(function (p) { return "<p>" + fmt(p) + "</p>"; }).join("") +
        (s.notesRef ? '<p class="notes-ref">' + fmt(s.notesRef) + "</p>" : "");
    } else {
      meta.textContent = "Slide " + pad(s.number) + " · " + (s.owner || "");
      body.innerHTML = '<p class="notes-empty">Awaiting speaker notes from ' + esc(s.owner || "the slide owner") + ".</p>";
    }
  }
  function setNotes(open) {
    state.notesOpen = open;
    $("notes-panel").hidden = !open;
    $("btn-notes").setAttribute("aria-pressed", String(open));
    document.body.classList.toggle("notes-open", open);
    fit();
  }

  /* ---------- 8. Contents ---------- */

  function buildToc() {
    var list = $("toc-list");
    list.innerHTML = "";
    state.data.forEach(function (s, i) {
      var li = el("li");
      var b = el("button", "toc-item",
        '<span class="toc-num">' + pad(i + 1) + "</span>" +
        '<span class="toc-text"><span class="toc-topic">' + esc(s ? s.topic : "Content error") + "</span>" +
        '<span class="toc-meta">' + esc(s ? s.owner : "") + " · " + (s && isFinal(s) ? "Final" : "Awaiting content") + "</span></span>");
      b.type = "button";
      b.addEventListener("click", function () { go(i); setToc(false); });
      li.appendChild(b);
      list.appendChild(li);
    });
  }
  function updateToc() {
    var items = document.querySelectorAll(".toc-item");
    for (var k = 0; k < items.length; k++) {
      if (k === state.index) items[k].setAttribute("aria-current", "true");
      else items[k].removeAttribute("aria-current");
    }
  }
  function setToc(open) {
    state.tocOpen = open;
    $("toc").hidden = !open;
    $("toc-backdrop").hidden = !open;
    $("btn-toc").setAttribute("aria-expanded", String(open));
    if (open) {
      var cur = document.querySelector('.toc-item[aria-current="true"]') || document.querySelector(".toc-item");
      if (cur) cur.focus();
    } else {
      $("btn-toc").focus();
    }
  }

  /* ---------- 9. "Follow one idea" dialog ---------- */

  var dialog = null;
  function openExample(b, trigger) {
    if (dialog) dialog.remove();
    dialog = document.createElement("dialog");
    dialog.className = "example-dialog";
    dialog.setAttribute("aria-labelledby", "ex-title");
    var step = 0;
    function render() {
      var steps = b.steps || [];
      var flow = steps.map(function (s, i) {
        return '<li class="flow-step' + (i === step ? " is-current" : "") + (i < step ? " is-done" : "") + '">' +
          '<button type="button" class="flow-btn" data-step="' + i + '"' + (i === step ? ' aria-current="step"' : "") + ">" +
          '<span class="flow-n">' + (i + 1) + "</span>" + esc(s.name) + "</button></li>";
      }).join('<li class="flow-arrow" aria-hidden="true">→</li>');
      dialog.innerHTML =
        '<div class="ex-head"><span class="tag tag-example">' + fmt(b.badge || "Illustrative example") + "</span>" +
        '<button type="button" class="tb-btn ex-close" aria-label="Close example">✕ Close</button></div>' +
        '<h2 id="ex-title"><span class="example-code">' + fmt(b.code) + "</span> · " + fmt(b.title) + "</h2>" +
        '<ol class="flow">' + flow + "</ol>" +
        '<div class="ex-detail" aria-live="polite"><p class="ex-step-name">Step ' + (step + 1) + " of " + steps.length + ": " + esc(steps[step].name) + "</p>" +
        "<p>" + fmt(steps[step].detail) + "</p></div>" +
        '<div class="ex-actions">' +
        '<button type="button" class="tb-btn ex-prev"' + (step === 0 ? " disabled" : "") + ">← Back</button>" +
        (step < steps.length - 1
          ? '<button type="button" class="btn-primary ex-next">Next step →</button>'
          : '<button type="button" class="btn-primary ex-done">Back to slide</button>') +
        "</div>";
      dialog.querySelector(".ex-close").onclick = close;
      dialog.querySelector(".ex-prev").onclick = function () { step--; render(); focusMain(); };
      var n = dialog.querySelector(".ex-next"); if (n) n.onclick = function () { step++; render(); focusMain(); };
      var d = dialog.querySelector(".ex-done"); if (d) d.onclick = close;
      Array.prototype.forEach.call(dialog.querySelectorAll(".flow-btn"), function (fb) {
        fb.onclick = function () { step = +fb.getAttribute("data-step"); render(); dialog.querySelector('.flow-btn[data-step="' + step + '"]').focus(); };
      });
    }
    function focusMain() {
      var t = dialog.querySelector(".ex-next") || dialog.querySelector(".ex-done");
      if (t) t.focus();
    }
    function close() { dialog.close(); }
    render();
    dialog.addEventListener("close", function () {
      dialog.remove();
      dialog = null;
      trigger.focus();
    });
    dialog.addEventListener("keydown", function (e) {
      // Keep slide navigation from reacting while the dialog is open.
      e.stopPropagation();
      if (e.key === "Escape") { e.preventDefault(); close(); }
    });
    document.body.appendChild(dialog);
    dialog.showModal();
    focusMain();
  }

  /* ---------- 10. Keyboard, buttons, fullscreen, PDF ---------- */

  function shouldIgnoreKey(e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return true;
    if (dialog) return true;
    var t = e.target;
    if (!t || !t.closest) return false;
    if (t.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']")) return true;
    if (t.closest("[data-interactive]")) return true; // a focused control on the slide keeps its keys
    return false;
  }

  document.addEventListener("keydown", function (e) {
    if (state.tocOpen) {
      if (e.key === "Escape") { e.preventDefault(); setToc(false); }
      return;
    }
    if (e.key === "Escape" && !dialog && e.target && e.target.closest && e.target.closest("[data-interactive]")) {
      e.target.blur(); $("deck").focus(); return; // Esc hands the keys back to slide navigation
    }
    if (shouldIgnoreKey(e)) return;
    var onButton = e.target && e.target.closest && e.target.closest("button, a");
    switch (e.key) {
      case "ArrowRight": case "PageDown": e.preventDefault(); next(); break;
      case "ArrowLeft": case "PageUp": e.preventDefault(); prev(); break;
      case " ": if (!onButton) { e.preventDefault(); e.shiftKey ? prev() : next(); } break;
      case "Home": e.preventDefault(); go(0); break;
      case "End": e.preventDefault(); go(state.total - 1); break;
      case "f": case "F": e.preventDefault(); toggleFullscreen(); break;
      case "n": case "N": e.preventDefault(); setNotes(!state.notesOpen); break;
      case "t": case "T": e.preventDefault(); setToc(true); break;
      case "p": case "P": e.preventDefault(); window.print(); break;
      case "Escape": if (state.notesOpen) setNotes(false); break;
    }
  });

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
  }
  document.addEventListener("fullscreenchange", function () {
    var fs = !!document.fullscreenElement;
    document.body.classList.toggle("is-fullscreen", fs);
    $("btn-fs").setAttribute("aria-pressed", String(fs));
    fit();
  });

  // Toolbar fades out in full screen after a few idle seconds.
  var idleTimer = null;
  function wake() {
    document.body.classList.remove("is-idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { if (document.fullscreenElement) document.body.classList.add("is-idle"); }, 2500);
  }
  document.addEventListener("mousemove", wake);

  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 6000);
  }

  $("btn-prev").addEventListener("click", prev);
  $("btn-next").addEventListener("click", next);
  $("btn-notes").addEventListener("click", function () { setNotes(!state.notesOpen); });
  $("btn-toc").addEventListener("click", function () { setToc(!state.tocOpen); });
  $("btn-toc-close").addEventListener("click", function () { setToc(false); });
  $("toc-backdrop").addEventListener("click", function () { setToc(false); });
  $("btn-fs").addEventListener("click", toggleFullscreen);
  $("btn-print").addEventListener("click", function () { window.print(); });
  $("btn-pdf").addEventListener("click", function (e) {
    // If the PDF has not been built (e.g. opened locally before running the export), fall back to printing.
    if (!/^https?:/.test(location.protocol)) return;
    var a = this;
    e.preventDefault();
    fetch(a.getAttribute("href"), { method: "HEAD", cache: "no-store" }).then(function (r) {
      if (r.ok) {
        var tmp = document.createElement("a");
        tmp.href = a.href; tmp.download = a.getAttribute("download") || "";
        document.body.appendChild(tmp); tmp.click(); tmp.remove();
      } else {
        toast("The PDF file has not been built here yet. Opening Print / Save as PDF instead.");
        window.print();
      }
    }).catch(function () { window.location.href = a.href; });
  });

  window.addEventListener("resize", fit);
  window.addEventListener("hashchange", function () {
    var i = slideFromHash();
    if (i !== null) go(i);
  });
  window.addEventListener("beforeprint", function () {
    document.title = cfg.title + (state.draft ? " (Draft)" : "") + " · Team 8";
  });

  /* ---------- 11. Start ---------- */

  loadSlides(cfg.slides || [], function () {
    var files = cfg.slides || [];
    var total = files.length;
    state.total = total;
    state.data = [];
    var draft = false;
    for (var n = 1; n <= total; n++) {
      var s = Deck.slides[n];
      var node;
      if (s) {
        node = buildSlide(s, n - 1, total);
        if (!isFinal(s)) draft = true;
      } else {
        draft = true;
        var msgs = Deck.errors.filter(function (m) { return m.indexOf(files[n - 1]) !== -1; });
        if (!msgs.length) msgs = ["content/slides/" + files[n - 1] + ": expected a slide with number: " + n + "."];
        node = errorSlide(n, total, msgs);
      }
      state.data.push(s || null);
      state.slides.push(node);
      stage.appendChild(node);
    }
    state.draft = draft;
    document.documentElement.classList.toggle("deck-draft", draft);
    $("draft-badge").hidden = !draft;
    if (draft) document.title = cfg.title + " (Draft) · Team 8";
    buildToc();

    var start = slideFromHash();
    state.index = -1;
    go(start === null ? 0 : start, { announce: true });
    fit();

    var root = document.documentElement;
    root.setAttribute("data-deck-ready", "true");
    root.setAttribute("data-deck-slides", String(total));
    root.setAttribute("data-deck-final", String(Object.keys(Deck.slides).filter(function (k) { return isFinal(Deck.slides[k]); }).length));
    root.setAttribute("data-deck-draft", String(draft));
    if (Deck.errors.length) root.setAttribute("data-deck-errors", Deck.errors.join(" | "));
  });
})();
