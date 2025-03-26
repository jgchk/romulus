import { relations } from 'drizzle-orm'
import { pgTable, text } from 'drizzle-orm/pg-core'

export const mediaTypes = pgTable('media_types', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  parents: text('parents').array(),
})

export const mediaTypeRelations = relations(mediaTypes, ({ many }) => ({
  parents: many(mediaTypeParents, { relationName: 'children' }),
  children: many(mediaTypeParents, { relationName: 'parents' }),
}))

export const mediaTypeParents = pgTable('media_type_parents', {
  parentId: text('parent_id')
    .notNull()
    .references(() => mediaTypes.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  childId: text('child_id')
    .notNull()
    .references(() => mediaTypes.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const mediaTypeParentRelations = relations(mediaTypeParents, ({ one }) => ({
  parent: one(mediaTypes, {
    fields: [mediaTypeParents.parentId],
    references: [mediaTypes.id],
    relationName: 'parents',
  }),
  child: one(mediaTypes, {
    fields: [mediaTypeParents.childId],
    references: [mediaTypes.id],
    relationName: 'children',
  }),
}))
