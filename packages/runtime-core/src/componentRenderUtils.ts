import { createVNode, Text } from './vnode'
import { ShapeFlags } from '@vue/shared'

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

export function renderComponentRoot(instance) {
  const { vnode, render, data } = instance

  let result

  try {
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      // 将响应式的data作为render函数的this，让render内可以访问到data
      result = normalizeVNode(render!.call(data))
    }
  } catch (error) {
    console.error(error)
  }

  return result
}
