export function activate(el, ...classes) {
  if (!el) return el
  el.style.opacity = '1'
  if (classes.length > 0) {
    el.classList.add(...classes)
  } else {
    el.classList.add('active')
  }
  return el
}

export function deactivate(el, ...classes) {
  if (!el) return el
  el.style.opacity = '0'
  if (classes.length > 0) {
    el.classList.remove(...classes)
  } else {
    el.classList.remove('active')
  }
  return el
}
