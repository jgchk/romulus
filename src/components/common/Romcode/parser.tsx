import Link from 'next/link'
import { FC, ReactNode, useMemo } from 'react'

import { useSimpleGenreQuery } from '../../../services/genres'

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

const parser = (str: string): Root => {
  const paragraphs = str.split('\n')
  return {
    type: 'Root',
    children: paragraphs.map((paragraph) => ({
      type: 'Paragraph',
      children: parseParagraph(paragraph),
    })),
  }
}

const compiler = (root: Root): ReactNode => (
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

const GenreLink: FC<{ id: number }> = ({ id }) => {
  const { data, error } = useSimpleGenreQuery(id)

  const text = useMemo(() => {
    if (data) {
      return data.name
    }

    if (error) {
      return 'Error'
    }

    return 'Loading'
  }, [data, error])

  return (
    <Link href={{ pathname: '/genres/[id]', query: { id: id.toString() } }}>
      <a>{text}</a>
    </Link>
  )
}

export const useRomcode = (data: string) =>
  useMemo(() => {
    const parsed = parser(data)
    const compiled = compiler(parsed)
    return compiled
  }, [data])
