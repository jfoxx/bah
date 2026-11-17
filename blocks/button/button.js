const observers = new WeakMap();

function updateSettings(block) {
  const settings = {};
  const keys = ['open in new tab', 'open', 'externalize', 'alignment', 'appearance', 'style'];

  [...block.children].forEach((row) => {
    const [keyCell, valueCell] = row.children;
    const key = keyCell?.textContent.trim().toLowerCase();
    const isSetting = keys.includes(key) && !row.querySelector('a[href]');
    row.hidden = isSetting;
    row.classList.toggle('button-content', !isSetting);
    if (isSetting) settings[key] = valueCell?.textContent.trim().toLowerCase();
  });

  block.dataset.alignment = ['left', 'center', 'right'].includes(settings.alignment)
    ? settings.alignment : 'left';
  block.dataset.appearance = settings.appearance === 'link' ? 'link' : 'button';
  block.dataset.style = settings.style === 'secondary' ? 'secondary' : 'primary';

  const openInNewTab = settings['open in new tab'] !== undefined
    ? settings['open in new tab'] === 'true' : settings.open === '_blank';
  block.querySelectorAll('.button-content a[href]').forEach((link) => {
    link.classList.remove('button', 'primary', 'secondary', 'accent');
    link.target = openInNewTab ? '_blank' : '_self';
    if (link.target === '_blank') link.relList.add('noopener');
    else link.relList.remove('noopener');
  });
}

export default function decorate(block) {
  observers.get(block)?.disconnect();
  updateSettings(block);
  const observer = new MutationObserver(() => {
    if (!block.isConnected) {
      observer.disconnect();
      observers.delete(block);
      return;
    }
    updateSettings(block);
  });
  observer.observe(block, { childList: true, characterData: true, subtree: true });
  observers.set(block, observer);
}
