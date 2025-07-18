import { createDep, Dep } from './dep'

/**
 * 目标对象与依赖的映射
 * key: 目标对象
 * value: Map对象
 * - key: 目标对象的属性
 * - value: 目标对象的依赖fn
 */
type keyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<object, keyToDepMap>()

/**
 * 创建响应式副作用
 * @param fn 副作用函数
 */
export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

// 当前激活的副作用函数
export let activeEffect: ReactiveEffect | undefined = undefined

/**
 * 响应式副作用函数类
 */
export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {
    this.fn = fn
  }
  run() {
    activeEffect = this
    return this.fn()
  }
}

/**
 * 依赖收集
 * @param target 目标对象
 * @param key 目标对象的属性
 */
export function track(target: object, key: string | symbol) {
  // 如果当前没有激活的副作用函数，则直接返回(不需要收集依赖)
  if (!activeEffect) return
  // 获取目标对象的依赖映射
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  // 设置目标对象属性的依赖
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }
  trackEffects(dep)
  console.log('收集依赖结束', targetMap)
}

/**
 * 利用dep依次跟踪指定key的所有effect
 */
export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}

/**
 * 依赖触发
 * @param target 目标对象
 * @param key 目标对象的属性
 * @param value 目标对象的属性值
 */
export function trigger(target: object, key: string | symbol, value: unknown) {
  console.log('触发依赖', target, key, value)

  const depsMap = targetMap.get(target)

  if (!depsMap) return

  // const effect = depsMap.get(key) as ReactiveEffect
  // if (!effect) return
  // effect.run()
  const dep = depsMap.get(key) as Dep
  if (!dep) return
  triggerEffects(dep)
}

/**
 * 依次触发指定key的所有effect
 * @param dep 依赖
 */
export function triggerEffects(dep: Dep) {
  const effects = Array.isArray(dep) ? dep : [...dep]
  // 遍历effect依次触发
  effects.forEach(effect => {
    triggerEffect(effect)
  })
}

/**
 * 触发指定effect
 * @param effect 副作用函数
 */
export function triggerEffect(effect: ReactiveEffect) {
  effect.run()
}
