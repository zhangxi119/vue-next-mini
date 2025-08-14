import { isString } from '@vue/shared'

export function patchStyle(el: Element, prev: any, next: any) {
  const style = (el as HTMLElement).style

  const isCssString = isString(next)

  if (next && !isCssString) {
    for (const key in next) {
      setStyle(style, key, next[key])
    }
    // 清除掉为空的旧样式
    if (prev && !isCssString) {
      for (const key in prev) {
        if (next[key] == null) {
          setStyle(style, key, '')
        }
      }
    }
  } else {
    for (const key in next) {
    }
  }
}

function setStyle(style: CSSStyleDeclaration, name: string, val: any) {
  style[name] = val
}
