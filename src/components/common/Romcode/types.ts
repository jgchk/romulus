export type Node = Root | Paragraph | Text | Bold | Italic | GenreLink | Link
export type Parent = Root | Paragraph | Bold | Italic
export type Child = Paragraph | Text | GenreLink | Link

export type Root = { type: 'Root'; children: Paragraph[] }
export type Paragraph = {
  type: 'Paragraph'
  children: (Text | Bold | Italic | GenreLink | Link)[]
}
export type Text = { type: 'Text'; text: string }
export type Bold = {
  type: 'Bold'
  children: (Text | Bold | Italic | GenreLink)[]
}
export type Italic = {
  type: 'Italic'
  children: (Text | Bold | Italic | GenreLink)[]
}

export type GenreLink = { type: 'GenreLink'; id: number }
export type Link = { type: 'Link'; href: string }
