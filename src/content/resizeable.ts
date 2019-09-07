import ResizeObserver from '@juggle/resize-observer';

function makeResizeable(ele: HTMLElement, direction?: string) {
  if (!direction) direction = 'both'
  ele.style.resize = direction

  const ro = new ResizeObserver((entries, observer) => {
    ele.dispatchEvent(new Event('z_resize'))
  });
  ro.observe(ele);
}

export default makeResizeable