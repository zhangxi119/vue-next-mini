import { EMPTY_OBJ, isString, ShapeFlags } from '@vue/shared'
import { Text, Comment, Fragment, isSameVNodeType } from './vnode'
import { normalizeVNode } from './componentRenderUtils'

export interface RendererOptions {
  // 为指定的 element 的props打补丁
  patchProp(el: Element, key: string, prevValue: any, nextValue: any): void
  setElementText(el: any, text: string): void
  // 在给定的 parent 下添加指定元素
  insert(el: Element, parent: any, anchor?: any): void
  // 移除给定的元素
  remove(el: Element): void
  // 创建元素
  createElement(type: string): any
  // 创建文本节点
  createText(text: string): Text
  setText(node: Text, text: string): void
  // 创建注释节点
  createComment(text: string): Comment
  setComment(node: Comment, text: string): void
}

export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions): any {
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    remove: hostRemove,
    createText: hostCreateText,
    setText: hostSetText,
    createComment: hostCreateComment,
    setComment: hostSetComment
  } = options

  // 挂载实操函数
  const mountElement = (vnode: any, container: any, anchor: any = null) => {
    const { type, props, shapeFlag, children } = vnode
    // 1.创建element
    const el = (vnode.el = hostCreateElement(type))
    // 2.设置文本
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // TODO: 挂载array children
    }
    // 3.设置props
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    // 4.插入
    hostInsert(el, container, anchor)
  }

  // 更新实操函数
  const patchElement = (oldVNode: any, newVNode: any) => {
    const el = (newVNode.el = oldVNode.el)
    // 为空时需要置为空对象，不然后续patchProps时会对空状态异常处理
    const oldProps = oldVNode.props || EMPTY_OBJ
    const newProps = newVNode.props || EMPTY_OBJ

    // 更新children
    patchChildren(oldVNode, newVNode, el, null)
    // 更新props
    patchProps(el, newVNode, oldProps, newProps)
  }

  // 子节点打补丁
  const patchChildren = (oldVNode: any, newVNode: any, container: any, anchor: any) => {
    const c1 = oldVNode && oldVNode.children
    const c2 = newVNode && newVNode.children
    const prevShapeFlag = (oldVNode && oldVNode.shapeFlag) || 0
    const shapeFlag = (newVNode && newVNode.shapeFlag) || 0

    // 新节点是文本TEXT_CHILDREN
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 旧节点是数组ARRAY_CHILDREN，直接卸载
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // TODO: 卸载旧子节点
      }
      // 新旧子节点文本不一致，更新文本
      if (c2 !== c1) {
        // 挂载新子节点的文本
        hostSetElementText(container, c2)
      }
    } else {
      // 旧节点是文本ARRAY_CHILDREN
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新节点是数组ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: diff运算
        } else {
          // 新节点是文本TEXT_CHILDREN
          // TODO: 卸载旧子节点
        }
      } else {
        // 旧节点不是数组ARRAY_CHILDREN
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 删除旧节点的文本
          hostSetElementText(container, '')
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: 挂载新子节点
        }
      }
    }
  }

  // 挂载子节点 - Fragment
  const mountChildren = (children: any, container: any, anchor: any) => {
    if (isString(children)) {
      children = children.split('')
    }
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]))
      patch(null, child, container, anchor)
    }
  }
  // 更新props
  const patchProps = (el: Element, vnode: any, oldProps: any, newProps: any) => {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prev = oldProps[key]
        const next = newProps[key]
        if (prev !== next) {
          hostPatchProp(el, key, prev, next)
        }
      }
    }
    // 如果旧props有，新props没有，则删除
    if (oldProps !== EMPTY_OBJ) {
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
  }

  // 文本节点
  const processText = (oldVNode: any, newVNode: any, container: any, anchor: any) => {
    if (oldVNode === null) {
      // 挂载
      newVNode.el = hostCreateText(newVNode.children)
      hostInsert(newVNode.el, container, anchor)
    } else {
      // 更新
      const el = (newVNode.el = oldVNode.el!)
      if (newVNode.children !== oldVNode.children) {
        hostSetText(el, newVNode.children)
      }
    }
  }

  // 注释节点
  const processComment = (oldVNode: any, newVNode: any, container: any, anchor: any) => {
    if (oldVNode === null) {
      // 挂载
      newVNode.el = hostCreateComment(newVNode.children)
      hostInsert(newVNode.el, container, anchor)
    } else {
      newVNode.el = oldVNode.el
    }
  }

  // 元素操作函数 - 转发
  const processElement = (oldVNode: any, newVNode: any, container: any, anchor = null) => {
    if (oldVNode === null) {
      // 挂载
      mountElement(newVNode, container, anchor)
    } else {
      // TODO: 更新
      patchElement(oldVNode, newVNode)
    }
  }

  // 片段节点
  const processFragment = (oldVNode: any, newVNode: any, container: any, anchor: any) => {
    if (oldVNode === null) {
      // 挂载
      mountChildren(newVNode.children, container, anchor)
    } else {
      // 更新
      patchChildren(oldVNode, newVNode, container, anchor)
    }
  }

  const patch = (oldVNode: any, newVNode: any, container: any, anchor = null) => {
    if (oldVNode === newVNode) {
      return
    }
    // 判断是否是相同节点,不相同时直接卸载旧元素
    if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      unmount(oldVNode)
      oldVNode = null
    }

    const { type, shapeFlag } = newVNode

    switch (type) {
      case Text:
        processText(oldVNode, newVNode, container, anchor)
        break
      case Comment:
        processComment(oldVNode, newVNode, container, anchor)
        break
      case Fragment:
        processFragment(oldVNode, newVNode, container, anchor)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(oldVNode, newVNode, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // TODO: 组件
          // processComponent(oldVNode, newVNode, container, anchor)
        }
    }
  }

  const unmount = (vnode: any) => {
    hostRemove(vnode.el)
  }

  const render = (vnode: any, container: any) => {
    if (vnode === null) {
      // 卸载
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      // 挂载 || 更新
      patch(container._vnode || null, vnode, container)
    }

    container._vnode = vnode
  }
  return {
    render
  }
}
