import { assert, describe, expect, test } from 'vitest'

import { parser } from './parser'

describe('parser', () => {
  describe('empty input', () => {
    test('returns Root node', () => {
      const res = parser('')
      assert(res.type === 'Root')

      const res2 = parser('a')
      assert(res2.type === 'Root')

      const res3 = parser('a\nb\n[Genre1]')
      assert(res3.type === 'Root')
    })

    test('parses empty text into empty Root', () => {
      const res = parser('')
      assert(res.type === 'Root')
      expect(res.children.length).toEqual(0)

      const res2 = parser('\n\n')
      expect(res2.children.length).toEqual(0)
    })
  })

  describe('paragraph', () => {
    test('parses single line of plain text into single paragraph', () => {
      const text = 'this is some example test'
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const textNode = paragraphNode.children[0]
      assert(textNode.type === 'Text')
      expect(textNode.text).toEqual(text)
    })

    test('parses multiple lines of plain text into multiple paragraphs', () => {
      const line1 = 'this is some example test'
      const line2 = 'another line of text'
      const text = `${line1}\n${line2}`
      const res = parser(text)

      expect(res.children.length).toEqual(2)

      const paragraphNode1 = res.children[0]
      assert(paragraphNode1.type === 'Paragraph')
      expect(paragraphNode1.children.length).toEqual(1)

      const textNode1 = paragraphNode1.children[0]
      assert(textNode1.type === 'Text')
      expect(textNode1.text).toEqual(line1)

      const paragraphNode2 = res.children[1]
      assert(paragraphNode1.type === 'Paragraph')
      expect(paragraphNode1.children.length).toEqual(1)

      const textNode2 = paragraphNode2.children[0]
      assert(textNode2.type === 'Text')
      expect(textNode2.text).toEqual(line2)
    })

    test('collapses multiple newlines into one', () => {
      const text = 'a\n\nb'
      const res = parser(text)
      expect(res.children.length).toEqual(2)
      assert(res.children[0].children[0].type === 'Text')
      expect(res.children[0].children[0].text).toEqual('a')
      assert(res.children[1].children[0].type === 'Text')
      expect(res.children[1].children[0].text).toEqual('b')

      const text2 = 'a\n\n'
      const res2 = parser(text2)
      expect(res2.children.length).toEqual(1)
      assert(res2.children[0].children[0].type === 'Text')
      expect(res2.children[0].children[0].text).toEqual('a')

      const text3 = '\n\na'
      const res3 = parser(text3)
      expect(res3.children.length).toEqual(1)
      assert(res3.children[0].children[0].type === 'Text')
      expect(res3.children[0].children[0].text).toEqual('a')
    })
  })

  describe('link', () => {
    test('parses single link', () => {
      const text = 'https://www.google.com'
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const linkNode = paragraphNode.children[0]
      assert(linkNode.type === 'Link')
      expect(linkNode.href).toEqual(text)
    })

    test('parses multiple links', () => {
      const link1 = 'https://www.google.com'
      const link2 = 'https://rateyourmusic.com'
      const text = `${link1} ${link2}`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(3)

      const link1Node = paragraphNode.children[0]
      assert(link1Node.type === 'Link')
      expect(link1Node.href).toEqual(link1)

      const textNode = paragraphNode.children[1]
      assert(textNode.type === 'Text')
      expect(textNode.text).toEqual(' ')

      const link2Node = paragraphNode.children[2]
      assert(link2Node.type === 'Link')
      expect(link2Node.href).toEqual(link2)
    })

    test('parses links with ports', () => {
      const text = 'http://localhost:3000/genres/448'
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const linkNode = paragraphNode.children[0]
      assert(linkNode.type === 'Link')
      expect(linkNode.href).toEqual(text)
    })
  })

  describe('genre link', () => {
    test('parses single genre link', () => {
      const id = 1
      const text = `[Genre${id}]`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const linkNode = paragraphNode.children[0]
      assert(linkNode.type === 'GenreLink')
      expect(linkNode.id).toEqual(id)
      expect(linkNode.text).toBeUndefined()
    })

    test('parses multiple genre links', () => {
      const id1 = 12
      const id2 = 8934
      const link1 = `[Genre${id1}]`
      const link2 = `[Genre${id2}]`
      const text = `${link1} ${link2}`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(3)

      const link1Node = paragraphNode.children[0]
      assert(link1Node.type === 'GenreLink')
      expect(link1Node.id).toEqual(id1)
      expect(link1Node.text).toBeUndefined()

      const textNode = paragraphNode.children[1]
      assert(textNode.type === 'Text')
      expect(textNode.text).toEqual(' ')

      const link2Node = paragraphNode.children[2]
      assert(link2Node.type === 'GenreLink')
      expect(link2Node.id).toEqual(id2)
      expect(link2Node.text).toBeUndefined()
    })

    test('parses name overrides', () => {
      const id = 1
      const aka = 'yah'
      const text = `[Genre${id},${aka}]`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const linkNode = paragraphNode.children[0]
      assert(linkNode.type === 'GenreLink')
      expect(linkNode.id).toEqual(id)
      expect(linkNode.text).toEqual(aka)
    })

    test('parses name overrides with surrounding whitespace', () => {
      const id = 1
      const aka = 'yah'
      const text = `[Genre${id}, ${aka}]`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const linkNode = paragraphNode.children[0]
      assert(linkNode.type === 'GenreLink')
      expect(linkNode.id).toEqual(id)
      expect(linkNode.text).toEqual(aka)
    })

    test('parses name overrides with commas', () => {
      const id = 1
      const aka = 'yah,yah'
      const text = `[Genre${id},${aka}]`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const linkNode = paragraphNode.children[0]
      assert(linkNode.type === 'GenreLink')
      expect(linkNode.id).toEqual(id)
      expect(linkNode.text).toEqual(aka)
    })

    test('parses multiple name overrides', () => {
      const id = 1
      const aka = 'yah'
      const text = `[Genre${id},${aka}] [Genre5]`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(3)

      const linkNode = paragraphNode.children[0]
      assert(linkNode.type === 'GenreLink')
      expect(linkNode.id).toEqual(id)
      expect(linkNode.text).toEqual(aka)
    })
  })

  describe('bold', () => {
    test('parses single bold item', () => {
      const innerText = 'yuh'
      const text = `**${innerText}**`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const boldNode = paragraphNode.children[0]
      assert(boldNode.type === 'Bold')
      expect(boldNode.children.length).toEqual(1)

      const textNode = boldNode.children[0]
      assert(textNode.type === 'Text')
      expect(textNode.text).toEqual(innerText)
    })
  })

  describe('italic', () => {
    test('parses single italic item', () => {
      const innerText = 'yuh'
      const text = `*${innerText}*`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const italicNode = paragraphNode.children[0]
      assert(italicNode.type === 'Italic')
      expect(italicNode.children.length).toEqual(1)

      const textNode = italicNode.children[0]
      assert(textNode.type === 'Text')
      expect(textNode.text).toEqual(innerText)
    })
  })

  describe('combinations', () => {
    test('parses bold & italic combo', () => {
      const innerText = 'yuh'
      const text = `***${innerText}***`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const italicNode = paragraphNode.children[0]
      assert(italicNode.type === 'Italic')
      expect(italicNode.children.length).toEqual(1)

      const boldNode = italicNode.children[0]
      assert(boldNode.type === 'Bold')
      expect(boldNode.children.length).toEqual(1)

      const textNode = boldNode.children[0]
      assert(textNode.type === 'Text')
      expect(textNode.text).toEqual(innerText)
    })

    test('parses bold genre link', () => {
      const id = 1
      const text = `**[Genre${id}]**`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const boldNode = paragraphNode.children[0]
      assert(boldNode.type === 'Bold')
      expect(boldNode.children.length).toEqual(1)

      const linkNode = boldNode.children[0]
      assert(linkNode.type === 'GenreLink')
      expect(linkNode.id).toEqual(id)
    })

    test('parses italic genre link', () => {
      const id = 1
      const text = `*[Genre${id}]*`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const italicNode = paragraphNode.children[0]
      assert(italicNode.type === 'Italic')
      expect(italicNode.children.length).toEqual(1)

      const linkNode = italicNode.children[0]
      assert(linkNode.type === 'GenreLink')
      expect(linkNode.id).toEqual(id)
    })

    test('parses bold & italic genre link', () => {
      const id = 1
      const text = `***[Genre${id}]***`
      const res = parser(text)

      expect(res.children.length).toEqual(1)

      const paragraphNode = res.children[0]
      assert(paragraphNode.type === 'Paragraph')
      expect(paragraphNode.children.length).toEqual(1)

      const italicNode = paragraphNode.children[0]
      assert(italicNode.type === 'Italic')
      expect(italicNode.children.length).toEqual(1)

      const boldNode = italicNode.children[0]
      assert(boldNode.type === 'Bold')
      expect(boldNode.children.length).toEqual(1)

      const linkNode = boldNode.children[0]
      assert(linkNode.type === 'GenreLink')
      expect(linkNode.id).toEqual(id)
    })
  })
})
