var mouseX
var mouseY
var boxTop = 555;
var boxLeft = 360;

var mask = document.createElement('div')
mask.id = 'caption-mask'
mask.style.top = `${boxTop}px`;
mask.style.left = `${boxLeft}px`;
document.body.appendChild(mask)

function onMouseDown(event) {
  event.preventDefault();

  mask.addEventListener('mousemove', onMouseMove, false);
  mask.addEventListener('mouseup', onMouseUp, false);
  mask.addEventListener('mouseout', onMouseOut, false);
  mouseX = event.pageX;
  mouseY = event.pageY;
}

function onMouseMove(event) {
  event.preventDefault();

  boxTop = boxTop + event.pageY - mouseY
  boxLeft = boxLeft + event.pageX - mouseX
  mask.style.top = `${boxTop}px`
  mask.style.left = `${boxLeft}px`

  mouseX = event.pageX;
  mouseY = event.pageY;
}

function onMouseUp(event) {
  mask.removeEventListener('mousemove', onMouseMove, false);
  mask.removeEventListener('mouseup', onMouseUp, false);
  mask.removeEventListener('mouseout', onMouseOut, false);
}

function onMouseOut(event) {
  mask.removeEventListener('mousemove', onMouseMove, false);
  mask.removeEventListener('mouseup', onMouseUp, false);
  mask.removeEventListener('mouseout', onMouseOut, false);
}

mask.addEventListener('mousedown', onMouseDown)