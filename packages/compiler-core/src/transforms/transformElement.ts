import { NodeTypes, createVNodeCall } from '../ast'

export const transformElement = (node, context) => {
  return function postTransformElement() {
    node = context.currentNode

    if (node.type !== NodeTypes.ELEMENT) {
      return
    }

    const { tag } = node
    let vnodeTag = `"${tag}"`
    let vondeProps = []
    let vnodeChildren = node.children

    node.codegenNode = createVNodeCall(context, vnodeTag, vondeProps, vnodeChildren)
  }
}
