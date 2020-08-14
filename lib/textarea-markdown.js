'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('whatwg-fetch');

var _markdownIt = require('markdown-it');

var _markdownIt2 = _interopRequireDefault(_markdownIt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextareaMarkdown = function () {
  function TextareaMarkdown(textarea) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TextareaMarkdown);

    this.textarea = textarea;
    this.options = Object.assign({
      endPoint: '/api/image.json',
      paramName: 'file',
      responseKey: 'url',
      csrfToken: null,
      placeholder: 'uploading %filename ...',
      plugins: []
    }, options);
    this.previews = [];
    this.setPreview();
    this.applyPreview();
    textarea.addEventListener("drop", function (e) {
      return _this.drop(e);
    });
    textarea.addEventListener("paste", function (e) {
      return _this.paste(e);
    });
    textarea.addEventListener("keyup", function (e) {
      return _this.keyup(e);
    });
  }

  _createClass(TextareaMarkdown, [{
    key: 'setPreview',
    value: function setPreview() {
      var _this2 = this;

      var selector = this.textarea.getAttribute('data-preview');
      if (selector) {
        Array.from(document.querySelectorAll(selector), function (e) {
          return _this2.previews.push(e);
        });
      }
    }
  }, {
    key: 'drop',
    value: function drop(event) {
      event.preventDefault();
      this.uploadAll(event.dataTransfer.files);
    }
  }, {
    key: 'paste',
    value: function paste(event) {
      var files = event.clipboardData.files;
      if (files.length > 0) {
        event.preventDefault();
        this.uploadAll(event.clipboardData.files);
      }
    }
  }, {
    key: 'keyup',
    value: function keyup(event) {
      this.applyPreview();
    }
  }, {
    key: 'triggerEvent',
    value: function triggerEvent(element, event) {
      if (document.createEvent) {
        // not IE
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true); // event type, bubbling, cancelable
        return element.dispatchEvent(evt);
      } else {
        // IE
        var evt = document.createEventObject();
        return element.fireEvent("on" + event, evt);
      }
    }
  }, {
    key: 'applyPreview',
    value: function applyPreview() {
      var _this3 = this;

      var plugins = this.plugins;
      if (this.previews) {
        this.previews.forEach(function (preview) {
          var md = new _markdownIt2.default({
            html: true,
            breaks: true,
            langPrefix: 'language-',
            linkify: true
          });

          plugins.forEach(function (plugin) {
            return md.use(plugin);
          });
          preview.innerHTML = md.render(_this3.textarea.value);
        });
      }
    }
  }, {
    key: 'uploadToOriginal',
    value: function uploadToOriginal(file) {}
  }, {
    key: 'uploadAll',
    value: function uploadAll(files) {
      var _this4 = this;

      Array.from(files, function (f) {
        return _this4.upload(f);
      });
    }
  }, {
    key: 'upload',
    value: function upload(file) {
      var _this5 = this;

      var reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function (event) {
        var text = '![' + _this5.options['placeholder'].replace(/\%filename/, file.name) + ']()';

        var beforeRange = _this5.textarea.selectionStart;
        var afterRange = text.length;
        var beforeText = _this5.textarea.value.substring(0, beforeRange);
        var afterText = _this5.textarea.value.substring(beforeRange, _this5.textarea.value.length);
        _this5.textarea.value = beforeText + '\n' + text + '\n' + afterText;

        var params = new FormData();
        params.append(_this5.options['paramName'], file);

        var headers = { 'X-Requested-With': 'XMLHttpRequest' };
        if (_this5.options['csrfToken']) {
          headers['X-CSRF-Token'] = _this5.options['csrfToken'];
        }

        fetch(_this5.options['endPoint'], {
          method: 'POST',
          headers: headers,
          credentials: 'same-origin',
          body: params
        }).then(function (response) {
          return response.json();
        }).then(function (json) {
          var responseKey = _this5.options['responseKey'];
          var url = json[responseKey];
          _this5.textarea.value = _this5.textarea.value.replace(text, '![' + file.name + '](' + url + ')\n');
          _this5.applyPreview();
        }).catch(function (error) {
          console.warn('parsing failed', error);
        });
      };
    }
  }]);

  return TextareaMarkdown;
}();

exports.default = TextareaMarkdown;
