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
  setElementText(el: Element, text: string) {
    el.textContent = text
  },
  createText(text: string) {
    return document.createTextNode(text)
  },
  setText(node: Text, text: string) {
    node.nodeValue = text
  },
  createComment(text: string) {
    return document.createComment(text)
  },
  setComment(node: Comment, text: string) {
    node.nodeValue = text
  }
}
