import { ReactNode } from 'react'

import GenreLink from './GenreLink'

type Root = { type: 'Root'; children: Paragraph[] }
type Paragraph = { type: 'Paragraph'; children: (Text | GenreLink)[] }
type Text = { type: 'Text'; data: { value: string } }
type GenreLink = { type: 'GenreLink'; data: { id: number } }

const parseParagraph = (str: string): (Text | GenreLink)[] => {
  const genreLinkRegex = /\[Genre(\d+)]/g
  const allMatches = str.matchAll(genreLinkRegex)

  let currIndex = 0
  const nodes: (Text | GenreLink)[] = []
  for (const match of allMatches) {
    const matchIndex = match.index ?? 0
    if (matchIndex !== 0) {
      const text = str.slice(currIndex, matchIndex)
      nodes.push({ type: 'Text', data: { value: text } })
    }

    const id = Number.parseInt(match[1])
    nodes.push({ type: 'GenreLink', data: { id } })
    currIndex = matchIndex + match[0].length
  }

  if (currIndex < str.length) {
    const text = str.slice(currIndex)
    nodes.push({ type: 'Text', data: { value: text } })
  }

  return nodes
}

export const parser = (str: string): Root => {
  const paragraphs = str
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  return {
    type: 'Root',
    children: paragraphs.map((paragraph) => ({
      type: 'Paragraph',
      children: parseParagraph(paragraph),
    })),
  }
}

export const compiler = (root: Root): ReactNode => (
  <>
    {root.children.map((paragraph, i) => (
      <p key={i}>
        {paragraph.children.map((node) =>
          node.type === 'Text' ? (
            node.data.value
          ) : (
            <GenreLink id={node.data.id} />
          )
        )}
      </p>
    ))}
  </>
)
