'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _baseLexer = require('./base-lexer');var _baseLexer2 = _interopRequireDefault(_baseLexer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

JSONLexer = function (_BaseLexer) {_inherits(JSONLexer, _BaseLexer);
    function JSONLexer() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, JSONLexer);return _possibleConstructorReturn(this, (JSONLexer.__proto__ || Object.getPrototypeOf(JSONLexer)).call(this,
        options));
    }_createClass(JSONLexer, [{ key: 'recurse', value: function recurse(

        obj, arr, path) {var _this2 = this;
            Object.keys(obj).forEach(function (key) {return (
                    Object.prototype.toString.apply(obj[key]) === '[object Object]' ?
                    _this2.recurse(obj[key], arr, path ? path + '.' + key : key) :
                    arr.push({
                        key: path ? path + '.' + key : key,
                        value: obj[key] }));});



            return arr;
        } }, { key: 'extract', value: function extract(

        content) {
            var json = JSON.parse(content);

            return this.recurse(json, []).map(function (x) {return {
                    key: x.key,
                    defaultValue: x.value };});

        } }]);return JSONLexer;}(_baseLexer2.default);exports.default = JSONLexer;module.exports = exports['default'];