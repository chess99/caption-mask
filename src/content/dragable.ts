
interface DragableOptions {
  limit: boolean
  ignoreArea: {
    width: number,
    height: number,
    bottom?: number,
    right?: number
  }
}

const defaultDragOption: DragableOptions = {
  limit: false,
  ignoreArea:
  {
    width: 20,
    height: 20,
    bottom: 0,
    right: 0
  }
}

/**
 * 
 * @param {HTMLElement} dragDom 
 * @param {HTMLElement} dragHandleEle [Optional]
 */
function makeDragable(dragDom: HTMLElement, dragHandleEle?: HTMLElement, options?: DragableOptions) {
  if (!dragHandleEle) dragHandleEle = dragDom;
  if (!options) options = defaultDragOption

  let mouseX: number
  let mouseY: number
  let boxTop: number
  let boxLeft: number


  function onMouseDown(event): void {
    mouseX = event.pageX;
    mouseY = event.pageY;

    let p = dragDom.getBoundingClientRect()
    boxTop = p.top;
    boxLeft = p.left;

    // position saved for resize handler etc.
    console.log(p.right - event.pageX)
    if (p.right - event.pageX < options.ignoreArea.width
      && p.bottom - event.pageY < options.ignoreArea.height) {
      console.log('dragable: mousedown on ignoreArea, return.')
      return
    }

    document.addEventListener('mousemove', onMouseMove, false);
    document.addEventListener('mouseup', onMouseUp, false);

    dragDom.dispatchEvent(new Event('z_dragstart'))
  }

  function onMouseMove(event) {
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

    dragDom.dispatchEvent(new Event('z_dragend'))
  }

  dragHandleEle.addEventListener('mousedown', onMouseDown)
}

export default makeDragable

