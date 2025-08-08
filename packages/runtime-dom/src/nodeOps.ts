export const nodeOps = {
  insert(child, parent, anchor = null) {
    parent.insertBefore(child, anchor)
  },
  remove(child: Element) {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  createElement(tag: string) {
    return document.createElement(tag)
  },
  // createText(text: string) {
  //   return document.createTextNode(text)
  // },
  setElementText(el: Element, text: string) {
    el.textContent = text
  }
}
