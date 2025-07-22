import { EMPTY_OBJ, hasChanged, isObject } from '@vue/shared'
import { isReactive } from 'packages/reactivity/src/reactive'
import { ReactiveEffect } from 'packages/reactivity/src/effect'
import { queuePreFlushCb } from 'packages/runtime-core/src/scheduler'

export interface WatchOptions {
  immediate?: boolean
  deep?: boolean
}

export function watch(source: any, cb: Function, options?: WatchOptions) {
  return doWatch(source, cb, options)
}

function doWatch(source: any, cb: Function, { immediate, deep }: WatchOptions = EMPTY_OBJ) {
  let getter: () => any

  if (isReactive(source)) {
    getter = () => source
    deep = true
  } else {
    getter = () => {}
  }

  // 如果需要深度监听，则需要创建一个代理对象，并进行依赖收集
  if (cb && deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  let oldValue = {}

  // job函数执行相当于watch执行
  const job = () => {
    if (cb) {
      const newValue = effect.run()
      if (deep || hasChanged(newValue, oldValue)) {
        cb(newValue, oldValue)
        oldValue = newValue
      }
    }
  }

  // 创建调度器
  const scheduler = () => queuePreFlushCb(job)

  const effect = new ReactiveEffect(getter, scheduler)

  if (cb) {
    // 立即执行直接调用job
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }

  return () => {
    effect.stop()
  }
}

// 依赖收集,递归调用访问一次所有的变量进行依赖收集
export function traverse(value: unknown) {
  if (!isObject(value)) return value

  for (const key in value as object) {
    traverse((value as object)[key])
  }

  return value
}
