export * from './shapeFlags'
export * from './normalizeProp'
export * from './toDisplayString'

/**
 * 判断是否为一个数组
 */
export const isArray = Array.isArray

/**
 * 判断是否为对象
 */
export const isObject = (val: unknown) => val !== null && typeof val === 'object'

/**
 * 判断值是否改变
 */
export const hasChanged = (value: unknown, oldValue: unknown): boolean => !Object.is(value, oldValue)

/**
 * 判断是否为函数
 */
export const isFunction = (val: unknown): val is Function => typeof val === 'function'

/**
 * 合并对象
 */
export const extend = Object.assign

/**
 * 空对象
 */
export const EMPTY_OBJ: { readonly [key: string]: any } = Object.freeze({})

/**
 * 空数组
 */
export const EMPTY_ARR: any[] = []

/**
 * 是否是字符串
 */
export const isString = (val: unknown): val is string => typeof val === 'string'

/**
 * 是否是绑定事件
 */
export const isOn = (key: string) => /^on[^a-z]/.test(key)
