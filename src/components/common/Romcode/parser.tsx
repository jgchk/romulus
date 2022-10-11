import { Bold, GenreLink, Link, Root, Text } from './types'
import { visit } from './visit'

const linkPlugin = (root: Root) => {
  const URL_REGEX = /(https?|chrome):\/\/[^\s#$.?].\S*/g

  return visit(root, (node, index, parent) => {
    if (node.type !== 'Text') return
    if (index === undefined) return
    if (parent === undefined) return

    const allMatches = node.text.matchAll(URL_REGEX)

    let currIndex = 0
    const nodes: (Text | Link)[] = []
    for (const match of allMatches) {
      const matchIndex = match.index ?? 0
      if (matchIndex !== 0) {
        const text = node.text.slice(currIndex, matchIndex)
        nodes.push({ type: 'Text', text })
      }

      const href = match[0]
      nodes.push({ type: 'Link', href })
      currIndex = matchIndex + match[0].length
    }

    if (currIndex < node.text.length) {
      const text = node.text.slice(currIndex)
      nodes.push({ type: 'Text', text })
    }

    parent.children.splice(index, 1, ...nodes)
  })
}

const genreLinkPlugin = (root: Root) => {
  const GENRE_LINK_REGEX = /\[Genre(\d+)]/g

  return visit(root, (node, index, parent) => {
    if (node.type !== 'Text') return
    if (index === undefined) return
    if (parent === undefined) return

    const allMatches = node.text.matchAll(GENRE_LINK_REGEX)

    let currIndex = 0
    const nodes: (Text | GenreLink)[] = []
    for (const match of allMatches) {
      const matchIndex = match.index ?? 0
      if (matchIndex !== 0) {
        const text = node.text.slice(currIndex, matchIndex)
        nodes.push({ type: 'Text', text })
      }

      const id = Number.parseInt(match[1])
      nodes.push({ type: 'GenreLink', id })
      currIndex = matchIndex + match[0].length
    }

    if (currIndex < node.text.length) {
      const text = node.text.slice(currIndex)
      nodes.push({ type: 'Text', text })
    }

    parent.children.splice(index, 1, ...nodes)
  })
}

// TODO: allow bolding any child
const boldPlugin = (root: Root) => {
  const BOLD_REGEX = /\*\*([^*]+)\*\*/g

  return visit(root, (node, index, parent) => {
    if (node.type !== 'Text') return
    if (index === undefined) return
    if (parent === undefined) return

    const allMatches = node.text.matchAll(BOLD_REGEX)

    let currIndex = 0
    const nodes: (Text | Bold)[] = []
    for (const match of allMatches) {
      const matchIndex = match.index ?? 0
      if (matchIndex !== 0) {
        const text = node.text.slice(currIndex, matchIndex)
        nodes.push({ type: 'Text', text })
      }

      const text = match[1]
      nodes.push({ type: 'Bold', text })
      currIndex = matchIndex + match[0].length
    }

    if (currIndex < node.text.length) {
      const text = node.text.slice(currIndex)
      nodes.push({ type: 'Text', text })
    }

    parent.children.splice(index, 1, ...nodes)
  })
}

export const parser = (str: string): Root => {
  const paragraphs = str
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  const root: Root = {
    type: 'Root',
    children: paragraphs.map((text) => ({
      type: 'Paragraph',
      children: [{ type: 'Text', text }],
    })),
  }
  linkPlugin(root)
  genreLinkPlugin(root)
  boldPlugin(root)

  return root
}
