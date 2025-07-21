import { hasChanged } from '@vue/shared'
import { createDep, Dep } from './dep'
import { activeEffect, trackEffects, triggerEffects } from './effect'
import { toReactive } from './reactive'
import { ComputedRefImpl } from './computed'

export interface Ref<T = any> {
  value: T
}

export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}

export function ref(value?: unknown) {
  return createRef(value, false)
}

/**
 * 主入口
 */
function createRef(rowValue: unknown, shallow: boolean) {
  if (isRef(rowValue)) {
    return rowValue
  }

  return new RefImpl(rowValue, shallow)
}

/**
 * ref实现类
 */
class RefImpl<T> {
  private _value: T

  // 原始值
  private _rawValue: T

  // 依赖数据
  public dep?: Dep = undefined

  // 是否是ref数据类型
  public readonly __v_isRef = true

  constructor(value: T, public readonly __v_isShallow: boolean) {
    this._rawValue = value
    this._value = __v_isShallow ? value : toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newVal) {
    if (hasChanged(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = toReactive(newVal)
      triggerRefValue(this)
    }
  }
}

/**
 * 收集依赖
 */
export function trackRefValue(r: RefImpl<any> | ComputedRefImpl<any>) {
  if (activeEffect) {
    trackEffects(r.dep || (r.dep = createDep()))
  }
}

/**
 * 触发依赖
 */
export function triggerRefValue(r: RefImpl<any> | ComputedRefImpl<any>) {
  if (r.dep) {
    triggerEffects(r.dep)
  }
}
