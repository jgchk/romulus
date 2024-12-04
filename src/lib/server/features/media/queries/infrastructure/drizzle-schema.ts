import { relations } from 'drizzle-orm'
import {
  type AnyPgColumn,
  boolean,
  foreignKey,
  integer,
  pgTable,
  primaryKey,
  text,
  uuid,
} from 'drizzle-orm/pg-core'

export const mediaTypeTreeTable = pgTable('media_type_trees', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  baseTreeId: uuid('base_tree_id').references((): AnyPgColumn => mediaTypeTreeTable.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  ownerId: integer('owner_id').notNull(),
  isMain: boolean('is_main').notNull(),
})

export const mediaTypeTreeRelations = relations(mediaTypeTreeTable, ({ many }) => ({
  mediaTypes: many(mediaTypeTable),
}))

export const mediaTypeTable = pgTable(
  'media_types',
  {
    id: uuid('id').notNull(),
    mediaTypeTreeId: uuid('media_type_tree_id')
      .notNull()
      .references(() => mediaTypeTreeTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    name: text('name').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id, table.mediaTypeTreeId] }),
  }),
)

export const mediaTypeRelations = relations(mediaTypeTable, ({ one, many }) => ({
  tree: one(mediaTypeTreeTable, {
    fields: [mediaTypeTable.mediaTypeTreeId],
    references: [mediaTypeTreeTable.id],
  }),
  parents: many(mediaTypeChildrenTable, { relationName: 'children' }),
  children: many(mediaTypeChildrenTable, { relationName: 'parents' }),
}))

export const mediaTypeChildrenTable = pgTable(
  'media_type_children',
  {
    mediaTypeTreeId: uuid('media_type_tree_id')
      .notNull()
      .references(() => mediaTypeTreeTable.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    parentId: uuid('parent_id').notNull(),
    childId: uuid('child_id').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.mediaTypeTreeId, table.parentId, table.childId] }),
    parentFk: foreignKey({
      columns: [table.parentId, table.mediaTypeTreeId],
      foreignColumns: [mediaTypeTable.id, mediaTypeTable.mediaTypeTreeId],
    }).onDelete('cascade'),
    childFk: foreignKey({
      columns: [table.childId, table.mediaTypeTreeId],
      foreignColumns: [mediaTypeTable.id, mediaTypeTable.mediaTypeTreeId],
    }).onDelete('cascade'),
  }),
)

export const mediaTypeChildrenRelations = relations(mediaTypeChildrenTable, ({ one }) => ({
  parent: one(mediaTypeTable, {
    fields: [mediaTypeChildrenTable.parentId, mediaTypeChildrenTable.mediaTypeTreeId],
    references: [mediaTypeTable.id, mediaTypeTable.mediaTypeTreeId],
    relationName: 'parents',
  }),
  child: one(mediaTypeTable, {
    fields: [mediaTypeChildrenTable.childId, mediaTypeChildrenTable.mediaTypeTreeId],
    references: [mediaTypeTable.id, mediaTypeTable.mediaTypeTreeId],
    relationName: 'children',
  }),
}))
