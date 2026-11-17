export default function decorate(block) {
  const settings = {};
  const keys = ['open', 'externalize', 'alignment', 'appearance', 'style'];

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

  block.querySelectorAll('.button-content a[href]').forEach((link) => {
    link.classList.remove('button', 'primary', 'secondary', 'accent');
    link.target = settings.open === '_blank' ? '_blank' : '_self';
    if (link.target === '_blank') link.relList.add('noopener');
    else link.relList.remove('noopener');
  });
}
