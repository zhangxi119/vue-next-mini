import { isArray, isObject } from '@vue/shared'
import { isVNode, createVNode } from './vnode'

export function h(type: any, propsOrChildren?: any, children?: any) {
  const l = arguments.length
  if (l === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // 如果 propsOrChildren 是 VNode 类型
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, propsOrChildren)
      }
      // propsOrChildren 是对象类型
      return createVNode(type, propsOrChildren, null)
    } else {
      // 如果 propsOrChildren 是数组类型
      return createVNode(type, null, propsOrChildren)
    }
  } else {
    if (l > 3) {
      // 如果 l > 3，则将 arguments 的第 3 个及以后的参数作为 children
      children = Array.prototype.slice.call(arguments, 2)
    } else if (l === 3 && isVNode(children)) {
      // 如果 l === 3 且 children 是 VNode 类型，则将 children 转换为数组
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }
}
