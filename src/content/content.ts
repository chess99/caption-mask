import addSomeEle from './SomeEle'
import './content.css';

const MASK_ID = 'caption-mask'

import makeDragable from './dragable'
import makeResizeable from './resizeable'

function initMask() {
  let mask: HTMLElement = document.getElementById(MASK_ID)
  if (mask) {
    console.log('initMask: already has a mask')
    return mask
  }

  mask = createEleWithSavedSize();

  // listen drag
  makeDragable(mask)
  mask.addEventListener('z_dragstart', () => console.log('on z_dragstart'))
  mask.addEventListener('z_dragend', () => { console.log('on z_dragend'); saveMaskSizing(mask) })

  // listen resize
  makeResizeable(mask)
  mask.addEventListener('z_resize', () => { console.log('on z_resize'); saveMaskSizing(mask) })

  let patentNode = document.fullscreenElement ? document.fullscreenElement : document.body
  patentNode.appendChild(mask)
  return mask
}

function createEleWithSavedSize(): HTMLElement {
  let boxSizing = loadMaskSizing();
  let mask = document.createElement('div');
  mask.id = MASK_ID;
  mask.style.position = 'fixed';
  mask.style.width = `${boxSizing.width}px`;
  mask.style.height = `${boxSizing.height}px`;
  mask.style.top = `${boxSizing.top}px`;
  mask.style.left = `${boxSizing.left}px`;

  addSomeEle(mask)
  return mask;
}

function isMaskExist() {
  return !!document.getElementById(MASK_ID)
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
  mask.parentElement.removeChild(mask)
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

let onFullscreenchange = evt => {
  console.log('fullscreenchange', document.fullscreenElement)
  
  let mask = document.getElementById(MASK_ID)
  if (!mask) return
  
  let ele = document.fullscreenElement
  if (ele) {
    document.body.removeChild(mask)
    ele.appendChild(mask)
  } else {
    document.body.appendChild(mask)
  }
}

if (!window.captionMask) {
  window.captionMask = {
    keyRegisterd: false,
    initialized: false
  }
}

if (!window.captionMask.initialized) {
  console.log('captionMask: register shortkey.')
  document.addEventListener('keyup', maskToggleHandler)

  console.log('captionMask: register fullscreenchange handler.')
  document.addEventListener('fullscreenchange', onFullscreenchange)

  window.captionMask.initialized = true
}

// toggle mask everytime click on extension button
toggleMask()
