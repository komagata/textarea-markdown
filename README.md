# textarea-markdown

[![https://gyazo.com/5759ef553225cfa788adf3596b90e256](https://i.gyazo.com/5759ef553225cfa788adf3596b90e256.gif)](https://gyazo.com/5759ef553225cfa788adf3596b90e256)

Make textarea a markdown editor.

## Usage

```
$ npm install textarea-markdown
```

```html
<h2>Editor</h2>
<textarea id="editor" data-preview="#preview"></textarea>

<h2>Preview</h2>
<div id="preview"></div>
```

```javascript
import TextareaMarkdown from 'textarea-markdown'

let textarea = document.querySelector('textarea');
new TextareaMarkdown(textarea);
```

with rails.

```html
<textarea id="editor" data-preview="#preview"></textarea>
<div id="preview"></div>
```

```javascript
import TextareaMarkdown from 'textarea-markdown'

document.addEventListener('DOMContentLoaded', () => {
  const token = document.querySelector("meta[name=\"csrf-token\"]").content;
  const textarea = document.querySelector('#editor');

  new TextareaMarkdown(textarea, {
    endPoint: '/api/image.json',
    paramName: 'file',
    responseKey: 'url',
    csrfToken: token,
    placeholder: 'uploading %filename ...',
    uploadImageTag: '<img src=%url width="100" height="100" alt="%filename">\n',
  })
});
```

### Options

#### useUploader
- type: Boolean
- default: true

Enable uploading files on drop when the value is set to true

#### file upload by file selection dialog
Enable uploading files by file selection dialog when using `<input>` as in the following code

```html
<h2>Editor & File input</h2>
<input type="file" class="data-input">
<textarea id="editor" data-preview="#preview" data-input=".input"></textarea>

<h2>Preview</h2>
<div id="preview"></div>
```

```javascript
import TextareaMarkdown from 'textarea-markdown'

let textarea = document.querySelector('textarea');
new TextareaMarkdown(textarea);
```
