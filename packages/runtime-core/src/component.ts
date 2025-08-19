import { reactive } from '@vue/reactivity'
import { isObject } from '@vue/shared'

let uid = 0

export function createComponentInstance(vnode: any) {
  const type = vnode.type

  const instance = {
    uid: uid++,
    vnode,
    type,
    subTree: null,
    effect: null,
    update: null,
    render: null
  }
  return instance
}

export function setupComponent(instance) {
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  finishComponentSetup(instance)
}

export function finishComponentSetup(instance) {
  // 定义的组件类型，即render函数
  const Component = instance.type
  instance.render = Component.render

  // 解析处理组件内的配置参数
  applyOptions(instance)
}

function applyOptions(instance) {
  const { data: dataOptions } = instance.type

  if (dataOptions) {
    const data = dataOptions()
    if (isObject(data)) {
      // 将data转换为响应式对象并挂在到组件的实例上
      instance.data = reactive(data)
    }
  }
}
