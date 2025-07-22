let isFlushPending = false

// 缓存任务队列
const pendingPreFlushCbs: Function[] = []

// 创建一个微任务
const resolvePromise = Promise.resolve() as Promise<void>

// 缓存当前微任务
let currentFlushPromise: Promise<void> | null = null

/**
 * 将回调函数添加到任务队列中
 * @param cb 回调函数
 */
export function queuePreFlushCb(cb: Function) {
  queueCb(cb, pendingPreFlushCbs)
}

function queueCb(cb: Function, pendingQueue: Function[]) {
  pendingQueue.push(cb)
  queueFlush()
}

function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvePromise.then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false
  flushPreFlushCbs()
}

export function flushPreFlushCbs() {
  if (pendingPreFlushCbs.length) {
    // 深拷贝并去重任务队列
    let activePreFlushCbs = [...new Set(pendingPreFlushCbs)]
    // 清空任务队列
    pendingPreFlushCbs.length = 0
    for (let i = 0; i < activePreFlushCbs.length; i++) {
      activePreFlushCbs[i]()
    }
  }
}
