import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // Habilitar extensão para geração de UUID se necessário
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

  // 1. Tabela usuario
  await knex.schema.createTable('usuario', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('name').notNullable()
    table.string('email').notNullable().unique()
    table.timestamp('email_verified', { useTz: true }).nullable()
    table.string('image').nullable()
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
    table.timestamp('update_at', { useTz: true }).defaultTo(knex.fn.now())
    table.string('password').nullable()
  })

  // 2. Tabela acesso
  await knex.schema.createTable('acesso', (table) => {
    table.uuid('id_usuario').primary().references('id').inTable('usuario').onDelete('CASCADE')
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
    table.timestamp('update_at', { useTz: true }).defaultTo(knex.fn.now())
    table.specificType('perfis', 'text[]').notNullable().defaultTo('{usuario}')
  })

  // 3. Tabela organizacao
  await knex.schema.createTable('organizacao', (table) => {
    table.uuid('id_organizacao').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('codigo').notNullable().unique()
    table.string('nome').notNullable()
    table.string('descricao').nullable()
    table.string('telefone').nullable()
    table.string('endereco').nullable()
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
    table.timestamp('update_at', { useTz: true }).defaultTo(knex.fn.now())
  })

  // 4. Tabela acessoeorganizacao (relação N:N de permissões por unidade)
  await knex.schema.createTable('acessoeorganizacao', (table) => {
    table.uuid('id_usuario').references('id').inTable('usuario').onDelete('CASCADE')
    table
      .uuid('id_organizacao')
      .references('id_organizacao')
      .inTable('organizacao')
      .onDelete('CASCADE')
    table.primary(['id_usuario', 'id_organizacao'])
    table.timestamp('assigned_at', { useTz: true }).defaultTo(knex.fn.now())
    table.string('papel').defaultTo('profissional')
  })

  // 5. Tabela slot
  await knex.schema.createTable('slot', (table) => {
    table.uuid('id_slot').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table
      .uuid('id_organizacao')
      .notNullable()
      .references('id_organizacao')
      .inTable('organizacao')
      .onDelete('CASCADE')
    table
      .uuid('id_profissional')
      .nullable()
      .references('id')
      .inTable('usuario')
      .onDelete('SET NULL')
    table.date('data').notNullable()
    table.time('inicio').notNullable()
    table.time('fim').notNullable()
    table.string('recurso').notNullable()
    table.integer('quantidade').notNullable().defaultTo(1)
    table.integer('quantidade_utilizada').notNullable().defaultTo(0)
    table.boolean('ativo').notNullable().defaultTo(true)
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
    table.timestamp('update_at', { useTz: true }).defaultTo(knex.fn.now())

    // UNIQUE constraint nomeada conforme especificação: UNIQUE(id_organizacao, inicio) nome "unique_slot_organizacao"
    table.unique(['id_organizacao', 'inicio'], { indexName: 'unique_slot_organizacao' })

    // Índices especificados
    table.index(['id_organizacao'], 'idx_slot_organizacao')
    table.index(['inicio'], 'idx_slot_inicio')
    table.index(['fim'], 'idx_slot_fim')
    table.index(['recurso'], 'idx_slot_recurso')
    table.index(['data'], 'idx_slot_data')
  })

  // 6. Tabela agendamento
  await knex.schema.createTable('agendamento', (table) => {
    table.uuid('id_agendamento').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.uuid('id_slot').notNullable().references('id_slot').inTable('slot').onDelete('CASCADE')
    table.uuid('id_usuario').notNullable().references('id').inTable('usuario').onDelete('CASCADE')
    table
      .uuid('id_organizacao')
      .notNullable()
      .references('id_organizacao')
      .inTable('organizacao')
      .onDelete('CASCADE')
    table.string('status').notNullable().defaultTo('agendado') // agendado, cancelado, concluido, falta
    table.text('observacao').nullable()
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
    table.timestamp('update_at', { useTz: true }).defaultTo(knex.fn.now())

    table.index(['id_slot'], 'idx_agendamento_slot')
    table.index(['id_usuario'], 'idx_agendamento_usuario')
    table.index(['id_organizacao'], 'idx_agendamento_organizacao')
  })

  // 7. Tabela contrato
  await knex.schema.createTable('contrato', (table) => {
    table.uuid('id_contrato').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.uuid('id_usuario').notNullable().references('id').inTable('usuario').onDelete('CASCADE')
    table
      .uuid('id_organizacao')
      .notNullable()
      .references('id_organizacao')
      .inTable('organizacao')
      .onDelete('CASCADE')
    table.boolean('ativo').notNullable().defaultTo(true)
    table.date('data_inicio').notNullable()
    table.date('data_fim').notNullable()
    table.integer('slots_por_dia').nullable()
    table.integer('slots_por_mes').nullable()
    table.integer('slots_por_semana').nullable()
    table.integer('saldo_slots').notNullable().defaultTo(10)
    table.string('plano_nome').nullable()
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
    table.timestamp('update_at', { useTz: true }).defaultTo(knex.fn.now())

    // UNIQUE constraint nomeada: UNIQUE(id_usuario, id_organizacao) nome "unique_contrato_usuario_organizacao"
    table.unique(['id_usuario', 'id_organizacao'], {
      indexName: 'unique_contrato_usuario_organizacao',
    })

    // Índices especificados
    table.index(['id_usuario'], 'idx_contrato_usuario')
    table.index(['id_organizacao'], 'idx_contrato_organizacao')
    table.index(['data_inicio'], 'idx_contrato_data_inicio')
    table.index(['data_fim'], 'idx_contrato_data_fim')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('contrato')
  await knex.schema.dropTableIfExists('agendamento')
  await knex.schema.dropTableIfExists('slot')
  await knex.schema.dropTableIfExists('acessoeorganizacao')
  await knex.schema.dropTableIfExists('organizacao')
  await knex.schema.dropTableIfExists('acesso')
  await knex.schema.dropTableIfExists('usuario')
}
