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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileType = require("file-type/browser");

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
      uploadImageTag: "![%filename](%url)\n",
      uploadVideoTag: '<video controls src="%url"></video>\n',
      uploadOtherTag: "[%filename (%fileSize)](%url)\n",
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
    var inputelement = this.setInputElement();
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
    if (inputelement) {
      inputelement.addEventListener("click", function (e) {
        return e.target.value = "";
      });
      inputelement.addEventListener("change", function (e) {
        return _this.input(e);
      });
    }
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
        return document.querySelector(selector);
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
      this.previews.forEach(function (preview) {
        var md = new _markdownIt2.default(markdownOptions);
        plugins.forEach(function (pluginEntry) {
          if (Array.isArray(pluginEntry)) {
            var _pluginEntry = _toArray(pluginEntry),
                plugin = _pluginEntry[0],
                pluginArgs = _pluginEntry.slice(1);

            md.use.apply(md, [plugin].concat(_toConsumableArray(pluginArgs)));
          } else {
            md.use(pluginEntry);
          }
        });
        preview.innerHTML = md.render(_this3.textarea.value);
      });

      this.options["afterPreview"]();
    }
  }, {
    key: "uploadToOriginal",
    value: function uploadToOriginal() {}
  }, {
    key: "uploadAll",
    value: async function uploadAll(files) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var file = _step.value;

          await this.upload(file);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "upload",
    value: async function upload(file) {
      var _this4 = this;

      var reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async function () {
        var bytes = new Uint8Array(reader.result);
        var fileType = await FileType.fromBuffer(bytes);
        var fileSize = (0, _filesize.filesize)(file.size, { base: 10, standard: "jedec" });
        var text = "![" + _this4.options["placeholder"].replace(/filename/, file.name) + "]()";

        var beforeRange = _this4.textarea.selectionStart;
        // const afterRange = text.length;
        var beforeText = _this4.textarea.value.substring(0, beforeRange);
        var afterText = _this4.textarea.value.substring(beforeRange, _this4.textarea.value.length);
        _this4.textarea.value = beforeText + "\n" + text + "\n" + afterText;

        var params = new FormData();
        params.append(_this4.options["paramName"], file);

        var headers = { "X-Requested-With": "XMLHttpRequest" };
        if (_this4.options["csrfToken"]) {
          headers["X-CSRF-Token"] = _this4.options["csrfToken"];
        }

        try {
          var response = await fetch(_this4.options["endPoint"], {
            method: "POST",
            headers: headers,
            credentials: "same-origin",
            body: params
          });
          var json = await response.json();
          var responseKey = _this4.options.responseKey;
          var url = json[responseKey];
          var placeholderTag = _this4.selectPlaceholderTag(fileType);

          var uploadTag = await _this4.replacePlaceholderTag(placeholderTag, file.name, fileSize, url);

          _this4.textarea.value = _this4.textarea.value.replace(text, uploadTag);
          _this4.applyPreview();
        } catch (error) {
          _this4.textarea.value = _this4.textarea.value.replace(text, "");
          console.warn("parsing failed", error);
        }
      };
    }
  }, {
    key: "selectPlaceholderTag",
    value: function selectPlaceholderTag(fileType) {
      if (this.options.imageableExtensions.includes(fileType.ext)) {
        return this.options.uploadImageTag;
      } else if (this.options.videoExtensions.includes(fileType.ext)) {
        return this.options.uploadVideoTag;
      } else {
        return this.options.uploadOtherTag;
      }
    }
  }, {
    key: "replacePlaceholderTag",
    value: async function replacePlaceholderTag(placeholderTag, filename, fileSize, url) {
      var commonPlaceholderTag = placeholderTag.replace(/%filename/g, filename).replace(/%url/g, url);

      if (placeholderTag === this.options.uploadImageTag) {
        var dimensions = await this.fetchImageDimensions(url);
        return commonPlaceholderTag.replace(/%width/g, dimensions.width).replace(/%height/g, dimensions.height);
      } else if (placeholderTag === this.options.uploadVideoTag) {
        return commonPlaceholderTag;
      } else {
        return commonPlaceholderTag.replace(/%fileSize/g, fileSize);
      }
    }
  }, {
    key: "fetchImageDimensions",
    value: function fetchImageDimensions(url) {
      return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onload = function () {
          resolve({ width: image.width, height: image.height });
        };
        image.onerror = function (error) {
          reject(error);
        };
        image.src = url;
      });
    }
  }]);

  return TextareaMarkdown;
}();

exports.default = TextareaMarkdown;
