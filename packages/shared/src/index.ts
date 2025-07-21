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
