import { reactive } from '@vue/reactivity'
import { isFunction, isObject } from '@vue/shared'
import { onBeforeMount, onMounted } from './apiLifecycle'

let uid = 0

// 生命周期钩子枚举
export const enum LifecycleHooks {
  BEFORE_CREATE = 'bc',
  CREATED = 'c',
  BEFORE_MOUNT = 'bm',
  MOUNTED = 'm',
  BEFORE_UPDATE = 'bu',
  UPDATED = 'u',
  BEFORE_UNMOUNT = 'bum',
  UNMOUNTED = 'um',
  DEACTIVATED = 'da',
  ACTIVATED = 'a',
  RENDER_TRIGGERED = 'rt'
}

export function createComponentInstance(vnode: any) {
  const type = vnode.type

  const instance = {
    uid: uid++,
    vnode,
    type,
    subTree: null,
    effect: null,
    update: null,
    render: null,
    bc: null,
    c: null,
    bm: null,
    m: null
  }
  return instance
}

export function setupComponent(instance) {
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type

  const { setup } = Component

  // composition api
  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  } else {
    // 选项式 options api
    finishComponentSetup(instance)
  }
}

export function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    instance.render = setupResult
  } else {
    // TODO: 处理不是函数的setupResult
  }
  finishComponentSetup(instance)
}

export function finishComponentSetup(instance) {
  // 定义的组件类型，即render函数
  const Component = instance.type

  if (!instance.render) {
    instance.render = Component.render
  }

  // 解析处理组件内的配置参数
  applyOptions(instance)
}

function applyOptions(instance) {
  const { data: dataOptions, beforeCreate, created, beforeMount, mounted } = instance.type

  // 调用beforeCreate钩子
  if (beforeCreate) {
    callHook(beforeCreate, instance.data)
  }

  if (dataOptions) {
    const data = dataOptions()
    if (isObject(data)) {
      // 将data转换为响应式对象并挂在到组件的实例上
      instance.data = reactive(data)
    }
  }

  // 调用created钩子
  if (created) {
    callHook(created, instance.data)
  }

  // 注册生命周期钩子
  function registerLifecycleHooks(register: Function, hook?: Function) {
    register(hook?.bind(instance.data), instance)
  }
  registerLifecycleHooks(onBeforeMount, beforeMount)
  registerLifecycleHooks(onMounted, mounted)
}

function callHook(hook: Function, proxy) {
  hook.bind(proxy)()
}
