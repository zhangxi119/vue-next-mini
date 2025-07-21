import { Dep } from './dep'
import { ReactiveEffect } from './effect'
import { isFunction } from '@vue/shared'
import { trackRefValue, triggerRefValue } from './ref'

export class ComputedRefImpl<T> {
  private _value: any
  public dep?: Dep = undefined

  public readonly effect: ReactiveEffect<T>

  public readonly __v_isRef = true

  // 是否是脏的，创建实例时即为true
  public _dirty = true

  constructor(getter: () => T) {
    // 传入getter和调度器
    this.effect = new ReactiveEffect(getter, () => {
      // 使用dirty标识状态避免死循环
      if (!this._dirty) {
        this._dirty = true
        triggerRefValue(this)
      }
    })
    // 将computed实例赋值给effect的computed属性
    this.effect.computed = this
  }

  get value() {
    // 收集依赖
    trackRefValue(this)
    // 如果计算属性是脏的，则执行effect的run方法，初始化计算属性的值并触发响应式数据的依赖收集
    if (this._dirty) {
      this._dirty = false
      // 执行effect的run方法，初始化计算属性的值并触发响应式数据的依赖收集
      this._value = this.effect.run()
    }
    // 返回计算属性的值
    return this._value
  }

  set value(newValue: T) {}
}

export function computed(getterOrOptions) {
  let getter

  const onlyGetter = isFunction(getterOrOptions)

  if (onlyGetter) {
    getter = getterOrOptions
  } else {
    getter = getterOrOptions.get
  }

  return new ComputedRefImpl(getter)
}
