export default function decorate(block) {
  const urgent = block.classList.contains('urgent');
  let label = block.querySelector(':scope > .alert-label');
  if (!label) {
    label = document.createElement('div');
    label.className = 'alert-label';
    label.setAttribute('aria-hidden', 'true');
    block.prepend(label);
  }
  label.textContent = urgent ? 'Urgent' : 'Notice';
  block.setAttribute('role', 'region');
  block.setAttribute('aria-label', urgent ? 'Urgent notice' : 'Notice');
}
