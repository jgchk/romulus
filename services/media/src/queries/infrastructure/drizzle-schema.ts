import { relations } from 'drizzle-orm'
import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core'

export const mediaTypes = pgTable('media_types', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
})

export const mediaTypeRelations = relations(mediaTypes, ({ many }) => ({
  parents: many(mediaTypeParents, { relationName: 'children' }),
  children: many(mediaTypeParents, { relationName: 'parents' }),
}))

export const mediaTypeParents = pgTable(
  'media_type_parents',
  {
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
  },
  (table) => [primaryKey({ columns: [table.parentId, table.childId] })],
)

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

export const mediaArtifactTypes = pgTable('media_artifact_types', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
})

export const mediaArtifactTypeRelations = relations(mediaArtifactTypes, ({ many }) => ({
  mediaTypes: many(mediaArtifactTypeMediaTypes),
}))

export const mediaArtifactTypeMediaTypes = pgTable(
  'media_artifact_type_media_types',
  {
    mediaArtifactTypeId: text('media_artifact_type_id')
      .notNull()
      .references(() => mediaArtifactTypes.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    mediaTypeId: text('media_type_id')
      .notNull()
      .references(() => mediaTypes.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
  (table) => [primaryKey({ columns: [table.mediaArtifactTypeId, table.mediaTypeId] })],
)

export const mediaArtifactTypeMediaTypeRelations = relations(
  mediaArtifactTypeMediaTypes,
  ({ one }) => ({
    mediaArtifactType: one(mediaArtifactTypes, {
      fields: [mediaArtifactTypeMediaTypes.mediaArtifactTypeId],
      references: [mediaArtifactTypes.id],
    }),
    mediaType: one(mediaTypes, {
      fields: [mediaArtifactTypeMediaTypes.mediaTypeId],
      references: [mediaTypes.id],
    }),
  }),
)

export const mediaArtifactRelationshipTypes = pgTable('media_artifact_relationship_types', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  parentMediaArtifactTypeId: text('parent_media_artifact_type_id')
    .notNull()
    .references(() => mediaArtifactTypes.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
})

export const mediaArtifactRelationshipTypeRelations = relations(
  mediaArtifactRelationshipTypes,
  ({ many }) => ({
    childMediaArtifactTypes: many(mediaArtifactRelationshipTypeChildren),
  }),
)

export const mediaArtifactRelationshipTypeChildren = pgTable(
  'media_artifact_relationship_type_children',
  {
    mediaArtifactRelationshipTypeId: text('media_artifact_relationship_type_id')
      .notNull()
      .references(() => mediaArtifactRelationshipTypes.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
    childMediaArtifactTypeId: text('child_media_artifact_type_id')
      .notNull()
      .references(() => mediaArtifactTypes.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      }),
  },
)

export const mediaArtifactRelationshipTypeChildrenRelations = relations(
  mediaArtifactRelationshipTypeChildren,
  ({ one }) => ({
    mediaArtifactRelationshipType: one(mediaArtifactRelationshipTypes, {
      fields: [mediaArtifactRelationshipTypeChildren.mediaArtifactRelationshipTypeId],
      references: [mediaArtifactRelationshipTypes.id],
    }),
    childMediaArtifactType: one(mediaArtifactTypes, {
      fields: [mediaArtifactRelationshipTypeChildren.childMediaArtifactTypeId],
      references: [mediaArtifactTypes.id],
    }),
  }),
)
