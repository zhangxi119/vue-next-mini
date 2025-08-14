import { isOn } from '@vue/shared'
import { patchClass } from './modules/class'
import { patchDOMProp } from './modules/props'
import { patchAttr } from './modules/attrs'
import { patchStyle } from './modules/style'
import { patchEvent } from './modules/event'

export const patchProp = (el: Element, key: string, prevValue: any, nextValue: any) => {
  // 处理 class、style、事件、attrs
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, prevValue, nextValue)
  } else if (isOn(key)) {
    patchEvent(el, key, prevValue, nextValue)
  } else if (shouldSetAsProp(el, key)) {
    patchDOMProp(el, key, nextValue)
  } else {
    patchAttr(el, key, nextValue)
  }
}

// 判断是否应该通过DOM操作Property的方式设置值
function shouldSetAsProp(el: Element, key: string) {
  if (key === 'form') {
    return false
  }
  if (key === 'list' && el.tagName === 'INPUT') {
    return false
  }
  if (key === 'type' && el.tagName === 'TEXTAREA') {
    return false
  }
  return key in el
}
