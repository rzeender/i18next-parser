'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _baseLexer = require('./base-lexer');var _baseLexer2 = _interopRequireDefault(_baseLexer);
var _javascriptLexer = require('./javascript-lexer');var _javascriptLexer2 = _interopRequireDefault(_javascriptLexer);
var _cheerio = require('cheerio');var _cheerio2 = _interopRequireDefault(_cheerio);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

HTMLLexer = function (_BaseLexer) {_inherits(HTMLLexer, _BaseLexer);
  function HTMLLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, HTMLLexer);var _this = _possibleConstructorReturn(this, (HTMLLexer.__proto__ || Object.getPrototypeOf(HTMLLexer)).call(this,
    options));

    _this.attr = options.attr || 'data-bind';
    _this.optionAttr = options.optionAttr || 'data-i18n-options';return _this;
  }_createClass(HTMLLexer, [{ key: 'parse', value: function parse(

    str) {
      var result = [],item = '',depth = 0;

      function push() {if (item) result.push(item);item = '';}

      for (var i = 0, c; c = str[i], i < str.length; i++) {
        if (!depth && c === ',') push();else
        {
          item += c;
          if (c === '{') depth++;
          if (c === '}') depth--;
        }
      }

      push();
      return result;
    } }, { key: 'extract', value: function extract(

    content) {var _this2 = this;
      var that = this;
      var $ = _cheerio2.default.load(content, {
        xml: {
          normalizeWhitespace: true } });



      var $$ = _cheerio2.default.load(content);

      $$('script[type="text/javascript"]:not([src])').each(function (index, node) {
        var $node = $(node);
        $node[0].children.forEach(function (x) {
          var jsLexer = new _javascriptLexer2.default({ sourceType: 'script' });
          //strip mustache tags
          var sanitized = x.data.
          replace(/{{{(#|\^).*?}}}|{{(#|\^).*?}}/g, '').
          replace(/{{{\/.*?}}}|{{\/.*?}}/g, '').
          replace(/({{{[^#\^]*?}}}|{{[^#\^]*?}})/g, undefined);

          var keys = jsLexer.extract(sanitized);
          _this2.keys = _this2.keys.concat(keys);
        });
      });

      $('[' + that.attr + ']').each(function (index, node) {
        var attr = node.attribs[that.attr];
        var pattern = /("|')?i18n("|')?\s*?:/;
        var htmlTag = /^\[[a-zA-Z0-9_-]*\]/;

        if (!pattern.test(attr)) {
          return;
        } else if (attr.trim().startsWith('{') && attr.trim().endsWith('}')) {
          attr = attr.trim().substr(1).slice(0, -1).trim();
        }

        var i18nChunk = _this2.parse(attr).filter(function (x) {return pattern.test(x);}).shift();
        var arr = i18nChunk.split(pattern);

        var expression = arr[arr.length - 1].trim();
        var rawKey = void 0;
        var val = void 0;

        try {
          val = new Function('return (' + expression + ');')();
        } catch (e) {}

        if (typeof val === 'string') {
          rawKey = val;
        } else if (Object.prototype.toString.call(val) === '[object Object]') {
          rawKey = val.key;
        } else {
          return;
        }

        var $node = _cheerio2.default.load(node);

        // the attribute can hold multiple keys
        var keys = rawKey.split(';');
        var options = node.attribs[that.optionAttr];

        if (options) {
          try {
            options = JSON.parse(options);
          } finally
          {}
        }var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {

          for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var key = _step.value;
            var isHtml = new RegExp(htmlTag).test(key);
            // remove any leading [] in the key
            key = key.replace(htmlTag, '');

            // if empty grab innerHTML from regex
            key = key || $node.text();

            if (key) {
              _this2.keys.push(_extends({}, options, { key: key, defaultValue: ((isHtml ? $(node).html() : $node.text()) || '').trim() }));
            }
          }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
      });

      return this.keys;
    } }]);return HTMLLexer;}(_baseLexer2.default);exports.default = HTMLLexer;module.exports = exports['default'];