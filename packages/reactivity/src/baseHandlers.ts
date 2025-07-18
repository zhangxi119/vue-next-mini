import { track, trigger } from './effect'

const get = createGetter()
const set = createSetter()

function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver)
    console.log('获取数据', key)
    // 收集依赖
    track(target, key)
    return res
  }
}

function createSetter() {
  return function set(target: object, key: string | symbol, value: unknown, receiver: object) {
    const result = Reflect.set(target, key, value, receiver)
    console.log('设置数据', key)
    // 触发依赖
    trigger(target, key, value)
    return result
  }
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set
}
