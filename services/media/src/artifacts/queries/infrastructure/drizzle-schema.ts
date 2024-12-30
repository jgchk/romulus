import { relations } from 'drizzle-orm'
import { jsonb, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core'

export const artifactSchemaTable = pgTable('artifact_schemas', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
})

export const artifactSchemaRelations = relations(artifactSchemaTable, ({ many }) => ({
  attributes: many(artifactAttributeSchemaTable),
}))

export const artifactAttributeSchemaTable = pgTable(
  'artifact_attribute_schemas',
  {
    artifactSchemaId: uuid('artifact_schema_id')
      .notNull()
      .references(() => artifactSchemaTable.id, {
        onDelete: 'cascade',
      }),
    id: uuid('id').notNull(),
    name: text('name').notNull(),
    type: text('type').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.artifactSchemaId, table.id] }),
  }),
)

export const artifactAttributeSchemaRelations = relations(
  artifactAttributeSchemaTable,
  ({ one }) => ({
    artifactSchema: one(artifactSchemaTable, {
      fields: [artifactAttributeSchemaTable.artifactSchemaId],
      references: [artifactSchemaTable.id],
    }),
  }),
)

export const relationSchemaTable = pgTable('relation_schemas', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  sourceArtifactSchemaId: uuid('source_artifact_schema_id')
    .notNull()
    .references(() => artifactSchemaTable.id, {
      onDelete: 'cascade',
    }),
  targetArtifactSchemaId: uuid('target_artifact_schema_id')
    .notNull()
    .references(() => artifactSchemaTable.id, {
      onDelete: 'cascade',
    }),
})

export const relationSchemaRelations = relations(relationSchemaTable, ({ many }) => ({
  attributes: many(relationAttributeSchemaTable),
}))

export const relationAttributeSchemaTable = pgTable(
  'relation_attribute_schemas',
  {
    relationSchemaId: uuid('relation_schema_id')
      .notNull()
      .references(() => relationSchemaTable.id, {
        onDelete: 'cascade',
      }),
    id: uuid('id').notNull(),
    name: text('name').notNull(),
    type: text('type').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.relationSchemaId, table.id] }),
  }),
)

export const relationAttributeSchemaRelations = relations(
  relationAttributeSchemaTable,
  ({ one }) => ({
    relationSchema: one(relationSchemaTable, {
      fields: [relationAttributeSchemaTable.relationSchemaId],
      references: [relationSchemaTable.id],
    }),
  }),
)

export const artifactTable = pgTable('artifacts', {
  id: uuid('id').primaryKey(),
  schemaId: uuid('schema_id').notNull(),
})

export const artifactRelations = relations(artifactTable, ({ many, one }) => ({
  attributes: many(artifactAttributeTable),
  schema: one(artifactSchemaTable, {
    fields: [artifactTable.schemaId],
    references: [artifactSchemaTable.id],
  }),
}))

export const artifactAttributeTable = pgTable(
  'artifact_attributes',
  {
    artifactId: uuid('artifact_id')
      .notNull()
      .references(() => artifactTable.id, { onDelete: 'cascade' }),
    id: uuid('id').notNull(),
    value: jsonb('value').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.artifactId, table.id] }),
  }),
)

export const artifactAttributeRelations = relations(artifactAttributeTable, ({ one }) => ({
  artifact: one(artifactTable, {
    fields: [artifactAttributeTable.artifactId],
    references: [artifactTable.id],
  }),
}))

export const relationTable = pgTable('relations', {
  id: uuid('id').primaryKey(),
  schemaId: text('schema_id').notNull(),
  sourceArtifactId: uuid('source_artifact_id')
    .notNull()
    .references(() => artifactTable.id, { onDelete: 'cascade' }),
  targetArtifactId: uuid('target_artifact_id')
    .notNull()
    .references(() => artifactTable.id, { onDelete: 'cascade' }),
})

export const relationRelations = relations(relationTable, ({ many }) => ({
  attributes: many(relationAttributeTable),
}))

export const relationAttributeTable = pgTable(
  'relation_attributes',
  {
    relationId: uuid('relation_id')
      .notNull()
      .references(() => relationTable.id, { onDelete: 'cascade' }),
    id: uuid('id').notNull(),
    value: jsonb('value').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.relationId, table.id] }),
  }),
)

export const relationAttributeRelations = relations(relationAttributeTable, ({ one }) => ({
  relation: one(relationTable, {
    fields: [relationAttributeTable.relationId],
    references: [relationTable.id],
  }),
}))
