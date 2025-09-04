import { isArray, isFunction, isObject, isString, ShapeFlags, normalizeClass } from '@vue/shared'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')
export const Comment = Symbol('Comment')

export interface VNode {
  __v_isVNode: true
  type: any
  props: Record<string, any>
  children: any
  shapeFlag: number
  key: any
}

export function isVNode(value: any): value is VNode {
  return value != null && value.__v_isVNode === true
}

// 创建虚拟节点
export function createVNode(type, props, children): VNode {
  if (props) {
    let { class: klass, style } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
  }

  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0

  return createBaseVNode(type, props, children, shapeFlag)
}

export { createVNode as createElementVNode }

function createBaseVNode(type, props, children, shapeFlag): VNode {
  const vnode = {
    __v_isVNode: true,
    type,
    props,
    children,
    shapeFlag,
    key: props?.key || null
  } as VNode

  normalizeChildren(vnode, children)

  return vnode
}

export function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
    // type= ShapeFlags.SLOT_CHILDREN
  } else if (isFunction(children)) {
    // type = ShapeFlags.COMPONENT
  } else {
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }

  vnode.children = children
  // 将dom的类型和children的类型进行或运算，形成最终的类型，也就是说shapeFlag是dom的类型和children的类型的并集
  vnode.shapeFlag |= type
}

export function isSameVNodeType(n1: VNode, n2: VNode) {
  return n1.type === n2.type && n1.key === n2.key
}
