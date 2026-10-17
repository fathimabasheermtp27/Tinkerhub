/* TinkerHub site runtime.
   Renders each page's <template> (with {{holes}}, <sc-for> and <sc-if>) using Preact,
   driven by the page's Component class (renderVals / setState / lifecycle). */
(function () {
  "use strict";
  var h = window.preact.h;
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var ONLY_HOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  var ATTR_MAP = { onclick: "onClick", oninput: "onInput", onchange: "onChange", viewbox: "viewBox", tabindex: "tabIndex", readonly: "readOnly", autocomplete: "autoComplete" };

  function lookup(expr, scope) {
    expr = expr.trim();
    if (expr === "true") return true;
    if (expr === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(expr)) return Number(expr);
    var parts = expr.split(".");
    var cur = scope;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, e) { var v = lookup(e, scope); return v == null ? "" : String(v); });
  }
  function attrValue(raw, scope) {
    var m = raw.match(ONLY_HOLE);
    if (m) return lookup(m[1], scope);
    return raw.indexOf("{{") !== -1 ? interp(raw, scope) : raw;
  }
  function child(scope, name, value) {
    var s = Object.create(scope);
    s[name] = value;
    return s;
  }
  function build(node, scope) {
    if (node.nodeType === 3) {
      var t = node.nodeValue;
      return t.indexOf("{{") === -1 ? t : interp(t, scope);
    }
    if (node.nodeType !== 1) return null;
    var tag = node.tagName.toLowerCase();
    if (tag === "sc-for") {
      var list = lookup((node.getAttribute("list") || "").replace(/[{}]/g, ""), scope) || [];
      var as = node.getAttribute("as") || "item";
      var out = [];
      list.forEach(function (item, idx) {
        var s = child(scope, as, item);
        s.$index = idx;
        Array.prototype.forEach.call(node.childNodes, function (c) { var v = build(c, s); if (v != null) out.push(v); });
      });
      return out;
    }
    if (tag === "sc-if") {
      var val = attrValue(node.getAttribute("value") || "", scope);
      if (!val) return null;
      var kids = [];
      Array.prototype.forEach.call(node.childNodes, function (c) { var v = build(c, scope); if (v != null) kids.push(v); });
      return kids;
    }
    var props = {};
    Array.prototype.forEach.call(node.attributes, function (a) {
      if (a.name.indexOf("hint-") === 0) return;
      var name = ATTR_MAP[a.name] || a.name;
      if (name === "class") name = "class";
      props[name] = attrValue(a.value, scope);
    });
    var children = [];
    var src = tag === "template" ? node.content.childNodes : node.childNodes;
    Array.prototype.forEach.call(src, function (c) { var v = build(c, scope); if (v != null) children.push(v); });
    return h.apply(null, [tag, props].concat(children));
  }

  window.DCLogic = function DCLogic(props) { this.props = props || {}; this.state = {}; };
  window.DCLogic.prototype.setState = function (patch) {
    var next = typeof patch === "function" ? patch(this.state, this.props) : patch;
    this.state = Object.assign({}, this.state, next);
    if (this.__schedule) this.__schedule();
  };

  window.TinkerRuntime = {
    mount: function (Component, tpl, root, props) {
      var inst = new Component(props || {});
      inst.props = props || {};
      inst.state = inst.state || {};
      var frag = tpl.content;
      var queued = false;
      var render = function () {
        queued = false;
        var vals = inst.renderVals ? inst.renderVals() : {};
        var kids = [];
        Array.prototype.forEach.call(frag.childNodes, function (c) { var v = build(c, vals); if (v != null) kids.push(v); });
        window.preact.render(h(window.preact.Fragment, null, kids), root);
      };
      inst.__schedule = function () { if (!queued) { queued = true; Promise.resolve().then(render); } };
      render();
      if (inst.componentDidMount) inst.componentDidMount();
      window.addEventListener("pagehide", function () { if (inst.componentWillUnmount) inst.componentWillUnmount(); });
      return inst;
    }
  };
})();
