import { createVNode, Text } from './vnode'

export function normalizeVNode(child: any) {
  // 是对象时就已经是vnode了
  if (typeof child === 'object') {
    return cloneIfMounted(child)
  }
  return createVNode(Text, null, String(child))
}

export function cloneIfMounted(child) {
  return child
}
