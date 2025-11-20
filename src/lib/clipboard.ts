export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    console.error('clipboard-error', error);
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  const selection = document.getSelection();
  const selected = selection ? selection.rangeCount > 0 ? selection.getRangeAt(0) : null : null;
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  if (selected && selection) {
    selection.removeAllRanges();
    selection.addRange(selected);
  }
  return true;
}
