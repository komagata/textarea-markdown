import "whatwg-fetch";
import MarkdownIt from "markdown-it";
const FileType = require('file-type/browser');
import { filesize } from "filesize";

export default class TextareaMarkdown {
  constructor(textarea, options = {}) {
    this.textarea = textarea;
    this.options = Object.assign(
      {
        useUploader: true,
        endPoint: "/api/image.json",
        paramName: "file",
        responseKey: "url",
        csrfToken: null,
        placeholder: "uploading %filename ...",
        imageableExtensions: ["jpg", "png", "gif"],
        videoExtensions: ["mov", "mp4", "webm"],
        afterPreview: () => {},
        plugins: [],
        markdownOptions: Object.assign({
          html: true,
          breaks: true,
          langPrefix: "language-",
          linkify: true,
        }),
      },
      options
    );
    this.previews = [];
    this.setPreview();
    this.applyPreview();
    if (this.options.useUploader) {
      textarea.addEventListener("dragover", (e) => e.preventDefault());
      textarea.addEventListener("drop", (e) => this.drop(e));
    }
    textarea.addEventListener("paste", (e) => this.paste(e));
    textarea.addEventListener("keyup", (e) => this.keyup(e));
  }

  setPreview() {
    const selector = this.textarea.getAttribute("data-preview");
    if (selector) {
      Array.from(document.querySelectorAll(selector), (e) =>
        this.previews.push(e)
      );
    }
  }

  drop(event) {
    event.preventDefault();
    this.uploadAll(event.dataTransfer.files);
  }

  paste(event) {
    const files = event.clipboardData.files;
    if (files.length > 0) {
      event.preventDefault();
      this.uploadAll(event.clipboardData.files);
    }
  }

  keyup() {
    this.applyPreview();
  }

  triggerEvent(element, event) {
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

  applyPreview() {
    const markdownOptions = this.options["markdownOptions"];
    const plugins = this.options["plugins"];
    if (this.previews) {
      this.previews.forEach((preview) => {
        let md = new MarkdownIt(markdownOptions);
        plugins.forEach((plugin) => md.use(plugin));
        preview.innerHTML = md.render(this.textarea.value);
      });
    }

    this.options["afterPreview"]();
  }

  uploadToOriginal() {}

  uploadAll(files) {
    Array.from(files, (f) => this.upload(f));
  }

  upload(file) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const bytes = new Uint8Array(reader.result);
      const fileType = await FileType.fromStream(bytes)["ext"];
      const fileSize = filesize(file.size, { base: 10, standard: "jedec" });
      const text =
        "![" +
        this.options["placeholder"].replace(/\%filename/, file.name) +
        "]()";

      const beforeRange = this.textarea.selectionStart;
      // const afterRange = text.length;
      const beforeText = this.textarea.value.substring(0, beforeRange);
      const afterText = this.textarea.value.substring(
        beforeRange,
        this.textarea.value.length
      );
      this.textarea.value = `${beforeText}\n${text}\n${afterText}`;

      let params = new FormData();
      params.append(this.options["paramName"], file);

      let headers = { "X-Requested-With": "XMLHttpRequest" };
      if (this.options["csrfToken"]) {
        headers["X-CSRF-Token"] = this.options["csrfToken"];
      }

      fetch(this.options["endPoint"], {
        method: "POST",
        headers: headers,
        credentials: "same-origin",
        body: params,
      })
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          const responseKey = this.options["responseKey"];
          const url = json[responseKey];
          if (this.options["imageableExtensions"].includes(fileType)) {
            this.textarea.value = this.textarea.value.replace(
              text,
              `![${file.name}](${url})\n`
            );
          } else if (this.options["videoExtensions"].includes(fileType)) {
            this.textarea.value = this.textarea.value.replace(
              text,
              `<video controls src="${url}"></video>\n`
            );
          } else {
            this.textarea.value = this.textarea.value.replace(
              text,
              `[${file.name} (${fileSize})](${url})\n`
            );
          }
          this.applyPreview();
        })
        .catch((error) => {
          this.textarea.value = this.textarea.value.replace(text, "");
          console.warn("parsing failed", error);
        });
    };
  }
}
