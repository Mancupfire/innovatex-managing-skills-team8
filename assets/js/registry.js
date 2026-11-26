/* Collects deck settings and slides from the files in content/.
   Content files call Deck.settings({...}) and Deck.slide({...}).
   You should not need to edit this file to change slide text. */
(function () {
  "use strict";
  var deck = {
    config: null,
    slides: {},
    errors: [],
    settings: function (cfg) { deck.config = cfg; },
    slide: function (data) {
      var src = document.currentScript && document.currentScript.getAttribute("src");
      var file = src || "unknown file";
      if (!data || typeof data.number !== "number") {
        deck.errors.push(file + ": the slide is missing its number.");
        return;
      }
      data._file = file;
      deck.slides[data.number] = data;
    }
  };
  window.Deck = deck;
})();
