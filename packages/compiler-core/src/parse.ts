import { NodeTypes, ElementTypes } from './ast'

export interface ParserContext {
  source: string
}

// 枚举
const enum TagType {
  Start,
  End
}

function createParserContext(content: string): ParserContext {
  return {
    source: content
  }
}

export function baseParse(content: string) {
  const context = createParserContext(content)

  const children = parseChildren(context, [])

  return createRoot(children)
}

export function createRoot(children) {
  return {
    type: NodeTypes.ROOT,
    children,
    loc: {}
  }
}

function parseChildren(context: ParserContext, ancestors) {
  const nodes = []

  while (!isEnd(context, ancestors)) {
    const s = context.source

    let node

    if (startsWith(s, '{{')) {
      // TODO
    } else if (s[0] === '<') {
      if (/[a-z]/i.test(s[1])) {
        node = parseElement(context, ancestors)
      }
    }

    if (!node) {
      node = parseText(context)
    }

    pushNode(nodes, node)
  }

  return nodes
}

// 解析Element元素
function parseElement(context: ParserContext, ancestors) {
  // 解析开始标签
  const element = parseTag(context, TagType.Start)

  // 解析子节点
  ancestors.push(element)
  const children = parseChildren(context, ancestors)
  ancestors.pop()
  element.children = children

  // 解析结束标签
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  }

  return element
}

// 解析Tag元素
function parseTag(context: ParserContext, type: TagType) {
  const match: any = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source)
  const tag = match[1]

  advanceBy(context, match[0].length)

  let isSelfClosing = startsWith(context.source, '/>')
  advanceBy(context, isSelfClosing ? 2 : 1) // 移动游标

  return {
    type: NodeTypes.ELEMENT,
    tag,
    tagType: ElementTypes.ELEMENT,
    children: [],
    props: []
  }
}

// 解析文本元素
function parseText(context: ParserContext) {
  const endTokens = ['<', '{{']

  let endIndex = context.source.length

  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const content = parseTextData(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content
  }
}

function parseTextData(context: ParserContext, length: number) {
  const rowText = context.source.slice(0, length)
  advanceBy(context, length)
  return rowText
}

function pushNode(nodes, node) {
  nodes.push(node)
}

function isEnd(context: ParserContext, ancestors) {
  const s = context.source

  if (startsWith(s, '</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      if (startsWithEndTagOpen(s, ancestors[i].tag)) {
        return true
      }
    }
  }
  return !s
}

// 判断是否为结束标签的开始
function startsWithEndTagOpen(source: string, tag: string): boolean {
  return startsWith(source, '</')
}

function startsWith(source: string, searchString: string) {
  return source.startsWith(searchString)
}

// 移动游标
function advanceBy(context: ParserContext, numberOfCharacters: number) {
  const { source } = context
  context.source = source.slice(numberOfCharacters)
}
