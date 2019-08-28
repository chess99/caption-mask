import * as React from "react";
import * as ReactDOM from "react-dom";

import ResizeObserver from '@juggle/resize-observer';

import './content.css';


var mouseX
var mouseY
var boxTop;
var boxLeft;
var mask



function initMaskEle(boxSizing) {
  var mask = document.createElement('div')
  mask.id = 'caption-mask'

  mask.style.position = 'fixed'
  mask.style.width = `${boxSizing.width}px`;
  mask.style.height = `${boxSizing.height}px`;
  mask.style.top = `${boxSizing.top}px`;
  mask.style.left = `${boxSizing.left}px`;

  document.body.appendChild(mask)
  return mask
}

function onMouseDown(event) {
  mouseX = event.pageX;
  mouseY = event.pageY;


  var p = mask.getBoundingClientRect()
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
  mask.style.top = `${boxTop}px`
  mask.style.left = `${boxLeft}px`

  mouseX = event.pageX;
  mouseY = event.pageY;
}

function onMouseUp(event) {
  document.removeEventListener('mousemove', onMouseMove, false);
  document.removeEventListener('mouseup', onMouseUp, false);

  saveMaskSizing(mask)
}

function loadMaskSizing() {
  var boxSizingStr = localStorage.getItem('caption-mask-sizing')
  var boxSizing = boxSizingStr ? JSON.parse(boxSizingStr) : { top: 0, left: 0, width: 800, height: 32 }
  return boxSizing
}

function saveMaskSizing(maskEle) {
  var boxSizing = maskEle.getBoundingClientRect()
  localStorage.setItem('caption-mask-sizing', JSON.stringify(boxSizing))
}

function SomeEle() {
  return (
    <div id='some-ele'>
      &nbsp;
    </div>
  )
}



function main() {
  let boxSizing = loadMaskSizing()
  boxTop = boxSizing.top
  boxLeft = boxSizing.left

  mask = initMaskEle(boxSizing)
  mask.addEventListener('mousedown', onMouseDown)

  const ro = new ResizeObserver((entries, observer) => {
    console.log('mask has resized!');
    saveMaskSizing(mask)
  });

  ro.observe(mask);
}

main()
ReactDOM.render(
  <SomeEle />,
  mask
);