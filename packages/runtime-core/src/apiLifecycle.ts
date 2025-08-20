import { LifecycleHooks } from './component'

// 给组件实例注入钩子
export function injectHook(type: LifecycleHooks, hook: Function, target: any) {
  if (target) {
    target[type] = hook
    return hook
  }
}

// 创建钩子函数
export const createHook = (lifecycle: LifecycleHooks) => {
  return (hook, target) => injectHook(lifecycle, hook, target)
}

// 创建beforeMount钩子函数
export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)

// 创建mounted钩子函数
export const onMounted = createHook(LifecycleHooks.MOUNTED)

// 创建beforeUpdate钩子函数
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE)

// 创建updated钩子函数
export const onUpdated = createHook(LifecycleHooks.UPDATED)
