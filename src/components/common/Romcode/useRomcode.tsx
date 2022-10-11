import { FC, ReactNode, useMemo } from 'react'

import RenderGenreLink from '../GenreLink'
import { parser } from './parser'
import { Node, Root } from './types'

export const compiler = (root: Root): ReactNode => <RenderNode node={root} />

const RenderNode: FC<{ node: Node }> = ({ node }) => {
  switch (node.type) {
    case 'Root': {
      return (
        <>
          {node.children.map((node, i) => (
            <RenderNode key={i} node={node} />
          ))}
        </>
      )
    }
    case 'Paragraph': {
      return (
        <p>
          {node.children.map((node, i) => (
            <RenderNode key={i} node={node} />
          ))}
        </p>
      )
    }
    case 'Text': {
      return <>{node.text}</>
    }
    case 'Bold': {
      return <b>{node.text}</b>
    }
    case 'Link': {
      // TODO: convert to <Link /> if it's a romulus link
      return <a href={node.href}>{node.href}</a>
    }
    case 'GenreLink': {
      return <RenderGenreLink id={node.id} />
    }
  }
}

const useRomcode = (data: string) =>
  useMemo(() => {
    const parsed = parser(data)
    const compiled = compiler(parsed)
    return compiled
  }, [data])

export default useRomcode
