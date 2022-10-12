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
        <p className='mb-3 leading-relaxed text-gray-700 last:mb-0'>
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
      return (
        <strong>
          {node.children.map((node, i) => (
            <RenderNode key={i} node={node} />
          ))}
        </strong>
      )
    }
    case 'Italic': {
      return (
        <em>
          {node.children.map((node, i) => (
            <RenderNode key={i} node={node} />
          ))}
        </em>
      )
    }
    case 'Link': {
      // TODO: convert to <Link /> if it's a romulus link
      return (
        <a href={node.href} className='underline'>
          {node.href}
        </a>
      )
    }
    case 'GenreLink': {
      return (
        <RenderGenreLink id={node.id} className='underline'>
          {node.text}
        </RenderGenreLink>
      )
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
