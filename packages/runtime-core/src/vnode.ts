import { isArray, isFunction, isObject, isString, ShapeFlags } from '@vue/shared'

export interface VNode {
  __v_isVNode: true
  type: any
  props: Record<string, any>
  children: any
  shapeFlag: number
}

export function isVNode(value: any): value is VNode {
  return value != null && value.__v_isVNode === true
}

export function createVNode(type, props, children): VNode {
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0

  return createBaseVNode(type, props, children, shapeFlag)
}

function createBaseVNode(type, props, children, shapeFlag): VNode {
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    shapeFlag
  } as VNode

  normalizeChildren(vnode, children)

  return vnode
}

export function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    // vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
    // vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
  } else if (isFunction(children)) {
    // vnode.shapeFlag |= ShapeFlags.COMPONENT
  } else {
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }

  vnode.children = children
  vnode.shapeFlag |= type
}
