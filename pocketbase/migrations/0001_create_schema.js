migrate(
  (app) => {
    // 1. Atualizar users com telefone se não tiver
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!usersCol.fields.getByName('phone')) {
      usersCol.fields.add(
        new TextField({
          name: 'phone',
          required: false,
        }),
      )
      app.save(usersCol)
    }

    // 2. Coleção organizacao
    const organizacao = new Collection({
      name: 'organizacao',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'codigo', type: 'text', required: true },
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao', type: 'text', required: false },
        { name: 'telefone', type: 'text', required: false },
        { name: 'endereco', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_organizacao_codigo ON organizacao (codigo)'],
    })
    app.save(organizacao)

    // 3. Coleção acesso (perfis do usuário: ex. ["admin", "usuario", "profissional"])
    const acesso = new Collection({
      name: 'acesso',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'id_usuario',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'perfis', type: 'json', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_acesso_usuario ON acesso (id_usuario)'],
    })
    app.save(acesso)

    const orgCol = app.findCollectionByNameOrId('organizacao')
    const acessoCol = app.findCollectionByNameOrId('acesso')

    // 4. Coleção acessoeorganizacao (vínculo N:N entre acesso/usuário e organização)
    const acessoeorganizacao = new Collection({
      name: 'acessoeorganizacao',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'id_usuario',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'id_acesso',
          type: 'relation',
          collectionId: acessoCol.id,
          required: false,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'id_organizacao',
          type: 'relation',
          collectionId: orgCol.id,
          required: true,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'papel', type: 'text', required: false }, // 'admin', 'profissional', 'membro'
        { name: 'assigned_at', type: 'date', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_acesso_org_user ON acessoeorganizacao (id_usuario)',
        'CREATE INDEX idx_acesso_org_org ON acessoeorganizacao (id_organizacao)',
      ],
    })
    app.save(acessoeorganizacao)

    // 5. Coleção slot (capacidade por sessão)
    const slot = new Collection({
      name: 'slot',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'id_organizacao',
          type: 'relation',
          collectionId: orgCol.id,
          required: true,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'id_profissional',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: false,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'data', type: 'text', required: true }, // formato YYYY-MM-DD
        { name: 'inicio', type: 'text', required: true }, // formato HH:mm
        { name: 'fim', type: 'text', required: true }, // formato HH:mm
        { name: 'recurso', type: 'text', required: true }, // ex. "Sala 1", "Musculação", "Studio Pilates"
        { name: 'quantidade', type: 'number', required: true, min: 1, onlyInt: true },
        { name: 'quantidade_utilizada', type: 'number', required: false, min: 0, onlyInt: true },
        { name: 'ativo', type: 'bool', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_slot_org ON slot (id_organizacao)',
        'CREATE INDEX idx_slot_data ON slot (data)',
        'CREATE INDEX idx_slot_inicio ON slot (inicio)',
        'CREATE INDEX idx_slot_recurso ON slot (recurso)',
      ],
    })
    app.save(slot)

    const slotCol = app.findCollectionByNameOrId('slot')

    // 6. Coleção agendamento
    const agendamento = new Collection({
      name: 'agendamento',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'id_slot',
          type: 'relation',
          collectionId: slotCol.id,
          required: true,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'id_usuario',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'id_organizacao',
          type: 'relation',
          collectionId: orgCol.id,
          required: true,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['agendado', 'cancelado', 'concluido', 'falta'],
          maxSelect: 1,
        },
        { name: 'observacao', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_agendamento_slot ON agendamento (id_slot)',
        'CREATE INDEX idx_agendamento_usuario ON agendamento (id_usuario)',
        'CREATE INDEX idx_agendamento_org ON agendamento (id_organizacao)',
        'CREATE INDEX idx_agendamento_status ON agendamento (status)',
      ],
    })
    app.save(agendamento)

    // 7. Coleção contrato
    const contrato = new Collection({
      name: 'contrato',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'id_usuario',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'id_organizacao',
          type: 'relation',
          collectionId: orgCol.id,
          required: true,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'ativo', type: 'bool', required: false },
        { name: 'data_inicio', type: 'text', required: true },
        { name: 'data_fim', type: 'text', required: true },
        { name: 'slots_por_dia', type: 'number', required: false, min: 0, onlyInt: true },
        { name: 'slots_por_semana', type: 'number', required: false, min: 0, onlyInt: true },
        { name: 'slots_por_mes', type: 'number', required: false, min: 0, onlyInt: true },
        { name: 'saldo_slots', type: 'number', required: false, min: 0, onlyInt: true },
        { name: 'plano_nome', type: 'text', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_contrato_user ON contrato (id_usuario)',
        'CREATE INDEX idx_contrato_org ON contrato (id_organizacao)',
        'CREATE INDEX idx_contrato_ativo ON contrato (ativo)',
      ],
    })
    app.save(contrato)
  },
  (app) => {
    const toDelete = [
      'contrato',
      'agendamento',
      'slot',
      'acessoeorganizacao',
      'acesso',
      'organizacao',
    ]
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
