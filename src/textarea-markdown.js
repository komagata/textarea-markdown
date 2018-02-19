import 'whatwg-fetch'
import MarkdownIt from 'markdown-it'
import MarkdownItPlantUML from 'markdown-it-plantuml'

export default class TextareaMarkdown {
  constructor(textarea, options = {}) {
    this.textarea = textarea;
    this.options = Object.assign({
      endPoint: '/api/image.json',
      paramName: 'file',
      responseKey: 'url',
      csrfToken: null,
      placeholder: 'uploading %filename ...'
    }, options)
    this.previews = [];
    this.setPreview();
    textarea.addEventListener("drop", e => this.drop(e));
    textarea.addEventListener("paste", e => this.paste(e));
    textarea.addEventListener("keyup", e => this.keyup(e));
  }

  setPreview() {
    const selector = this.textarea.getAttribute('data-preview');
    if (selector) {
      Array.from(document.querySelectorAll(selector), e => this.previews.push(e))
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

  keyup(event) {
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
      var evt = document.createEventObject();
      return element.fireEvent("on" + event, evt)
    }
  }

  applyPreview() {
    if (this.previews) {
      this.previews.forEach((preview) => {
        let md = new MarkdownIt({
          html: true,
          breaks: true,
          langPrefix: true,
          linkify: true
        });
        md.use(MarkdownItPlantUML);
        preview.innerHTML =  md.render(this.textarea.value);
      })
    }
  }

  uploadToOriginal(file) {

  }

  uploadAll(files) {
    Array.from(files, f => this.upload(f));
  }

  upload(file) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (event) => {
      const text = '![' + this.options['placeholder'].replace(/\%filename/, file.name) + ']()';

      const beforeRange = this.textarea.selectionStart;
      const afterRange = text.length;
      const beforeText = this.textarea.value.substring(0, beforeRange);
      const afterText = this.textarea.value.substring(beforeRange, this.textarea.value.length);
      this.textarea.value = `${beforeText}\n${text}\n${afterText}`;

      let params = new FormData();
      params.append(this.options['paramName'], file);

      let headers = { 'X-Requested-With': 'XMLHttpRequest' };
      if (this.options['csrfToken']) {
        headers['X-CSRF-Token'] = this.options['csrfToken'];
      }

      fetch(this.options['endPoint'], {
        method: 'POST',
        headers: headers,
        credentials: 'same-origin',
        body: params
      }).then((response) => {
        return response.json();
      }).then((json) => {
        const responseKey = this.options['responseKey'];
        const url = json[responseKey];
        this.textarea.value = this.textarea.value.replace(text, `![${file.name}](${url})\n`);
        this.applyPreview();
      }).catch((error) => {
        console.warn('parsing failed', error)
      })
    };
  }
}
