import TextareaMarkdown from '../src/textarea-markdown'

document.addEventListener('DOMContentLoaded', () => {
  const editor = document.querySelector('#editor');
  new TextareaMarkdown(editor, {
    endPoint: 'http://localhost:3000/api/image.json',
    paramName: 'file',
    responseKey: 'url'
  });
});
