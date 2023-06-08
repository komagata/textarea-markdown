"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require("whatwg-fetch");

var _markdownIt = require("markdown-it");

var _markdownIt2 = _interopRequireDefault(_markdownIt);

var _filesize = require("filesize");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileType = require('file-type/browser');

var TextareaMarkdown = function () {
  function TextareaMarkdown(textarea) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TextareaMarkdown);

    this.textarea = textarea;
    this.options = Object.assign({
      useUploader: true,
      endPoint: "/api/image.json",
      paramName: "file",
      responseKey: "url",
      csrfToken: null,
      placeholder: "uploading %filename ...",
      imageableExtensions: ["jpg", "png", "gif"],
      videoExtensions: ["mov", "mp4", "webm"],
      afterPreview: function afterPreview() {},
      plugins: [],
      markdownOptions: Object.assign({
        html: true,
        breaks: true,
        langPrefix: "language-",
        linkify: true
      })
    }, options);
    this.previews = [];
    this.setPreview();
    this.applyPreview();
    this.inputelements = [];
    this.setInputElement();
    if (this.options.useUploader) {
      textarea.addEventListener("dragover", function (e) {
        return e.preventDefault();
      });
      textarea.addEventListener("drop", function (e) {
        return _this.drop(e);
      });
    }
    textarea.addEventListener("paste", function (e) {
      return _this.paste(e);
    });
    textarea.addEventListener("keyup", function (e) {
      return _this.keyup(e);
    });
    this.inputelements.addEventListener('click', function (e) {
      return e.target.value = '';
    });
    this.inputelements.addEventListener("change", function (e) {
      return _this.input(e);
    });
  }

  _createClass(TextareaMarkdown, [{
    key: "setPreview",
    value: function setPreview() {
      var _this2 = this;

      var selector = this.textarea.getAttribute("data-preview");
      if (selector) {
        Array.from(document.querySelectorAll(selector), function (e) {
          return _this2.previews.push(e);
        });
      }
    }
  }, {
    key: "setInputElement",
    value: function setInputElement() {
      var selector = this.textarea.getAttribute("data-input");
      if (selector) {
        this.inputelements = document.querySelector(selector);
      }
    }
  }, {
    key: "drop",
    value: function drop(event) {
      event.preventDefault();
      this.uploadAll(event.dataTransfer.files);
    }
  }, {
    key: "paste",
    value: function paste(event) {
      var files = event.clipboardData.files;
      if (files.length > 0) {
        event.preventDefault();
        this.uploadAll(event.clipboardData.files);
      }
    }
  }, {
    key: "keyup",
    value: function keyup() {
      this.applyPreview();
    }
  }, {
    key: "input",
    value: function input(event) {
      var files = event.target.files;
      if (files.length > 0) {
        this.uploadAll(event.target.files);
      }
    }
  }, {
    key: "triggerEvent",
    value: function triggerEvent(element, event) {
      if (document.createEvent) {
        // not IE
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true); // event type, bubbling, cancelable
        return element.dispatchEvent(evt);
      } else {
        // IE
        var ieEvt = document.createEventObject();
        return element.fireEvent("on" + event, ieEvt);
      }
    }
  }, {
    key: "applyPreview",
    value: function applyPreview() {
      var _this3 = this;

      var markdownOptions = this.options["markdownOptions"];
      var plugins = this.options["plugins"];
      if (this.previews) {
        this.previews.forEach(function (preview) {
          var md = new _markdownIt2.default(markdownOptions);
          plugins.forEach(function (plugin) {
            return md.use(plugin);
          });
          preview.innerHTML = md.render(_this3.textarea.value);
        });
      }

      this.options["afterPreview"]();
    }
  }, {
    key: "uploadToOriginal",
    value: function uploadToOriginal() {}
  }, {
    key: "uploadAll",
    value: function uploadAll(files) {
      var _this4 = this;

      Array.from(files, function (f) {
        return _this4.upload(f);
      });
    }
  }, {
    key: "upload",
    value: function upload(file) {
      var _this5 = this;

      var reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async function () {
        var bytes = new Uint8Array(reader.result);
        var fileType = await FileType.fromBuffer(bytes);
        var fileSize = (0, _filesize.filesize)(file.size, { base: 10, standard: "jedec" });
        var text = "![" + _this5.options["placeholder"].replace(/\%filename/, file.name) + "]()";

        var beforeRange = _this5.textarea.selectionStart;
        // const afterRange = text.length;
        var beforeText = _this5.textarea.value.substring(0, beforeRange);
        var afterText = _this5.textarea.value.substring(beforeRange, _this5.textarea.value.length);
        _this5.textarea.value = beforeText + "\n" + text + "\n" + afterText;

        var params = new FormData();
        params.append(_this5.options["paramName"], file);

        var headers = { "X-Requested-With": "XMLHttpRequest" };
        if (_this5.options["csrfToken"]) {
          headers["X-CSRF-Token"] = _this5.options["csrfToken"];
        }

        fetch(_this5.options["endPoint"], {
          method: "POST",
          headers: headers,
          credentials: "same-origin",
          body: params
        }).then(function (response) {
          return response.json();
        }).then(function (json) {
          var responseKey = _this5.options["responseKey"];
          var url = json[responseKey];
          if (_this5.options["imageableExtensions"].includes(fileType.ext)) {
            _this5.textarea.value = _this5.textarea.value.replace(text, "![" + file.name + "](" + url + ")\n");
          } else if (_this5.options["videoExtensions"].includes(fileType.ext)) {
            _this5.textarea.value = _this5.textarea.value.replace(text, "<video controls src=\"" + url + "\"></video>\n");
          } else {
            _this5.textarea.value = _this5.textarea.value.replace(text, "[" + file.name + " (" + fileSize + ")](" + url + ")\n");
          }
          _this5.applyPreview();
        }).catch(function (error) {
          _this5.textarea.value = _this5.textarea.value.replace(text, "");
          console.warn("parsing failed", error);
        });
      };
    }
  }]);

  return TextareaMarkdown;
}();

exports.default = TextareaMarkdown;
