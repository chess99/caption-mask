var boxTop = 555;
var boxLeft = 360;

var mask = document.createElement('div')
mask.id = 'caption-mask'
mask.style.top = `${boxTop}px`;
mask.style.left = `${boxLeft}px`;
document.body.appendChild(mask)
makeDragable(mask)


/**
 * 
 * @param {Element} dragDom 
 * @param {Element} dragHandleEle [Optional]
 */
function makeDragable(dragDom, dragHandleEle) {
  if (!dragHandleEle) dragHandleEle = dragDom;

  var mouseX
  var mouseY
  var boxTop;
  var boxLeft;

  function onMouseDown(event) {
    event.preventDefault();
    mouseX = event.pageX;
    mouseY = event.pageY;

    var p = dragDom.getBoundingClientRect()
    boxTop = p.top;
    boxLeft = p.left;

    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mouseup', onMouseUp, false);
  }

  function onMouseMove(event) {
    event.preventDefault();

    boxTop = boxTop + event.pageY - mouseY
    boxLeft = boxLeft + event.pageX - mouseX
    dragDom.style.top = `${boxTop}px`
    dragDom.style.left = `${boxLeft}px`

    mouseX = event.pageX;
    mouseY = event.pageY;
  }

  function onMouseUp(event) {
    document.removeEventListener('mousemove', onMouseMove, false);
    document.removeEventListener('mouseup', onMouseUp, false);
  }

  dragHandleEle.addEventListener('mousedown', onMouseDown)
}