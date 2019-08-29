import * as React from "react";
import * as ReactDOM from "react-dom";

function SomeEle() {
  return (
    <div id='some-ele'>
      &nbsp;
    </div>
  )
}

function addSomeEle(parentEle) {
  ReactDOM.render(
    <SomeEle />,
    parentEle
  );
}

export default addSomeEle