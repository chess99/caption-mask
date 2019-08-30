import ResizeObserver from '@juggle/resize-observer';

import addSomeEle from './SomeEle'
import './content.css';

const MASK_ID = 'caption-mask'

let mouseX
let mouseY
let boxTop;
let boxLeft;

function initMask() {
  let mask = document.getElementById(MASK_ID)

  if (mask) {
    console.log('initMask: already has a mask')
    return mask
  }

  let boxSizing = loadMaskSizing()
  boxTop = boxSizing.top
  boxLeft = boxSizing.left

  mask = document.createElement('div')
  mask.id = MASK_ID
  mask.style.position = 'fixed'
  mask.style.width = `${boxSizing.width}px`;
  mask.style.height = `${boxSizing.height}px`;
  mask.style.top = `${boxSizing.top}px`;
  mask.style.left = `${boxSizing.left}px`;

  // listen drag
  mask.addEventListener('mousedown', onMouseDown)

  // listen resize
  const ro = new ResizeObserver((entries, observer) => {
    console.log('mask has resized!');
    saveMaskSizing(mask)
  });
  ro.observe(mask);

  document.body.appendChild(mask)
  addSomeEle(mask)
  return mask
}

function isMaskExist() {
  return !!document.getElementById(MASK_ID)
}

function onMouseDown(event) {
  mouseX = event.pageX;
  mouseY = event.pageY;

  let mask = document.getElementById(MASK_ID)
  let p = mask.getBoundingClientRect()
  boxTop = p.top;
  boxLeft = p.left;

  console.log(p.right - event.pageX)
  if (p.right - event.pageX < 20 && p.bottom - event.pageY < 20) return // 留给拉伸的位置
  console.log('go on')

  document.addEventListener('mousemove', onMouseMove, false);
  document.addEventListener('mouseup', onMouseUp, false);
}

function onMouseMove(event) {
  boxTop = boxTop + event.pageY - mouseY
  boxLeft = boxLeft + event.pageX - mouseX

  let mask = document.getElementById(MASK_ID)
  mask.style.top = `${boxTop}px`
  mask.style.left = `${boxLeft}px`

  mouseX = event.pageX;
  mouseY = event.pageY;
}

function onMouseUp(event) {
  document.removeEventListener('mousemove', onMouseMove, false);
  document.removeEventListener('mouseup', onMouseUp, false);

  let mask = document.getElementById(MASK_ID)
  saveMaskSizing(mask)
}

function loadMaskSizing() {
  let boxSizingStr = localStorage.getItem('caption-mask-sizing')
  let boxSizing = boxSizingStr ? JSON.parse(boxSizingStr) : { top: 0, left: 0, width: 800, height: 32 }
  return boxSizing
}

function saveMaskSizing(maskEle) {
  let boxSizing = maskEle.getBoundingClientRect()
  if (boxSizing.width === 0 && boxSizing.height === 0) return // TODO 关闭mask也会触发ResizeObserver
  localStorage.setItem('caption-mask-sizing', JSON.stringify(boxSizing))
}

function closeMask() {
  let mask = document.getElementById(MASK_ID)
  document.body.removeChild(mask)
  document.removeEventListener('mousemove', onMouseMove, false);
  document.removeEventListener('mouseup', onMouseUp, false);
}

function toggleMask() {
  if (isMaskExist()) closeMask()
  else initMask()
}

function maskToggleHandler(evt) {
  if (evt.key === 'k' && evt.altKey && !evt.ctrlKey && !evt.shiftKey) {
    toggleMask()
  }
}

if (!window.captionMaskNamespace) {
  window.captionMaskNamespace = {}
  window.captionMaskNamespace.maskToggleHandler = maskToggleHandler
}
document.addEventListener('keyup', window.captionMaskNamespace.maskToggleHandler)

toggleMask()
