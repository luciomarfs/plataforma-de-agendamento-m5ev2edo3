migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const orgCol = app.findCollectionByNameOrId('organizacao')
    const acessoCol = app.findCollectionByNameOrId('acesso')
    const acessoOrgCol = app.findCollectionByNameOrId('acessoeorganizacao')
    const slotCol = app.findCollectionByNameOrId('slot')
    const contratoCol = app.findCollectionByNameOrId('contrato')

    // 1. Seed Usuário Admin da Plataforma (Admin geral)
    let adminUser
    try {
      adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'luciomar.fs@gmail.com')
    } catch (_) {
      adminUser = new Record(usersCol)
      adminUser.setEmail('luciomar.fs@gmail.com')
      adminUser.setPassword('Skip@Pass')
      adminUser.setVerified(true)
      adminUser.set('name', 'Luciomar Admin')
      adminUser.set('phone', '5511999991111')
      app.save(adminUser)
    }

    // 2. Seed Usuário Aluno/Cliente de Teste
    let clientUser
    try {
      clientUser = app.findAuthRecordByEmail('_pb_users_auth_', 'aluno.demo@academia.com')
    } catch (_) {
      clientUser = new Record(usersCol)
      clientUser.setEmail('aluno.demo@academia.com')
      clientUser.setPassword('Skip@Pass')
      clientUser.setVerified(true)
      clientUser.set('name', 'Carlos Aluno Demo')
      clientUser.set('phone', '5511988882222')
      app.save(clientUser)
    }

    // 3. Seed Usuário Profissional (Instrutor / Fisioterapeuta)
    let profUser
    try {
      profUser = app.findAuthRecordByEmail('_pb_users_auth_', 'prof.marcos@academia.com')
    } catch (_) {
      profUser = new Record(usersCol)
      profUser.setEmail('prof.marcos@academia.com')
      profUser.setPassword('Skip@Pass')
      profUser.setVerified(true)
      profUser.set('name', 'Marcos Personal & Fisio')
      profUser.set('phone', '5511977773333')
      app.save(profUser)
    }

    // 4. Seed Perfis (acesso)
    // Admin
    try {
      app.findFirstRecordByData('acesso', 'id_usuario', adminUser.id)
    } catch (_) {
      const rec = new Record(acessoCol)
      rec.set('id_usuario', adminUser.id)
      rec.set('perfis', JSON.stringify(['admin', 'gestor']))
      app.save(rec)
    }

    // Aluno
    try {
      app.findFirstRecordByData('acesso', 'id_usuario', clientUser.id)
    } catch (_) {
      const rec = new Record(acessoCol)
      rec.set('id_usuario', clientUser.id)
      rec.set('perfis', JSON.stringify(['usuario']))
      app.save(rec)
    }

    // Profissional
    try {
      app.findFirstRecordByData('acesso', 'id_usuario', profUser.id)
    } catch (_) {
      const rec = new Record(acessoCol)
      rec.set('id_usuario', profUser.id)
      rec.set('perfis', JSON.stringify(['profissional', 'usuario']))
      app.save(rec)
    }

    // 5. Seed Organizações (Academias de exemplo)
    let org1
    try {
      org1 = app.findFirstRecordByData('organizacao', 'codigo', 'ACAD-FIT-01')
    } catch (_) {
      org1 = new Record(orgCol)
      org1.set('codigo', 'ACAD-FIT-01')
      org1.set('nome', 'BioFit Premium Moema')
      org1.set(
        'descricao',
        'Musculação, Fisioterapia Esportiva e Pilates Integrado com monitoramento profissional',
      )
      org1.set('telefone', '5511999990001')
      org1.set('endereco', 'Av. Moema, 1420 - Moema, São Paulo - SP')
      app.save(org1)
    }

    let org2
    try {
      org2 = app.findFirstRecordByData('organizacao', 'codigo', 'ACAD-FIT-02')
    } catch (_) {
      org2 = new Record(orgCol)
      org2.set('codigo', 'ACAD-FIT-02')
      org2.set('nome', 'Studio Fisio & Pilates Jardins')
      org2.set(
        'descricao',
        'Reabilitação, pilates clínico, eletroterapia e treino funcional individualizado',
      )
      org2.set('telefone', '5511999990002')
      org2.set('endereco', 'Rua Oscar Freire, 850 - Jardins, São Paulo - SP')
      app.save(org2)
    }

    // 6. Vínculos do Profissional (atua em mais de uma organização!)
    try {
      const existing = app.findRecordsByFilter(
        'acessoeorganizacao',
        `id_usuario = "${profUser.id}" && id_organizacao = "${org1.id}"`,
        '',
        1,
        0,
      )
      if (existing.length === 0) {
        const vinculo1 = new Record(acessoOrgCol)
        vinculo1.set('id_usuario', profUser.id)
        vinculo1.set('id_organizacao', org1.id)
        vinculo1.set('papel', 'profissional')
        app.save(vinculo1)
      }
    } catch (_) {}

    try {
      const existing = app.findRecordsByFilter(
        'acessoeorganizacao',
        `id_usuario = "${profUser.id}" && id_organizacao = "${org2.id}"`,
        '',
        1,
        0,
      )
      if (existing.length === 0) {
        const vinculo2 = new Record(acessoOrgCol)
        vinculo2.set('id_usuario', profUser.id)
        vinculo2.set('id_organizacao', org2.id)
        vinculo2.set('papel', 'profissional')
        app.save(vinculo2)
      }
    } catch (_) {}

    // Vínculo do Admin na Org1 e Org2
    try {
      const existing = app.findRecordsByFilter(
        'acessoeorganizacao',
        `id_usuario = "${adminUser.id}" && id_organizacao = "${org1.id}"`,
        '',
        1,
        0,
      )
      if (existing.length === 0) {
        const v = new Record(acessoOrgCol)
        v.set('id_usuario', adminUser.id)
        v.set('id_organizacao', org1.id)
        v.set('papel', 'admin')
        app.save(v)
      }
    } catch (_) {}

    // 7. Seed Contrato ativo para o aluno com saldo de slots
    try {
      const existing = app.findRecordsByFilter(
        'contrato',
        `id_usuario = "${clientUser.id}" && id_organizacao = "${org1.id}"`,
        '',
        1,
        0,
      )
      if (existing.length === 0) {
        const contrato = new Record(contratoCol)
        contrato.set('id_usuario', clientUser.id)
        contrato.set('id_organizacao', org1.id)
        contrato.set('ativo', true)
        contrato.set('plano_nome', 'Plano Fisioterapia & Pilates Gold')
        contrato.set('data_inicio', '2025-01-01')
        contrato.set('data_fim', '2025-12-31')
        contrato.set('slots_por_dia', 2)
        contrato.set('slots_por_semana', 4)
        contrato.set('slots_por_mes', 16)
        contrato.set('saldo_slots', 12)
        app.save(contrato)
      }
    } catch (_) {}

    // Contrato do admin também para poder testar agendamentos diretamente se quiser
    try {
      const existing = app.findRecordsByFilter(
        'contrato',
        `id_usuario = "${adminUser.id}" && id_organizacao = "${org1.id}"`,
        '',
        1,
        0,
      )
      if (existing.length === 0) {
        const contrato = new Record(contratoCol)
        contrato.set('id_usuario', adminUser.id)
        contrato.set('id_organizacao', org1.id)
        contrato.set('ativo', true)
        contrato.set('plano_nome', 'Plano Master Ilimitado')
        contrato.set('data_inicio', '2025-01-01')
        contrato.set('data_fim', '2026-12-31')
        contrato.set('slots_por_dia', 4)
        contrato.set('slots_por_semana', 10)
        contrato.set('slots_por_mes', 40)
        contrato.set('saldo_slots', 30)
        app.save(contrato)
      }
    } catch (_) {}

    // 8. Seed Slots da semana para demonstração
    // Gera datas para hoje, amanhã e depois de amanhã
    const now = new Date()
    const dateStr1 = now.toISOString().slice(0, 10)
    const d2 = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const dateStr2 = d2.toISOString().slice(0, 10)
    const d3 = new Date(now.getTime() + 48 * 60 * 60 * 1000)
    const dateStr3 = d3.toISOString().slice(0, 10)

    const sampleSlots = [
      {
        data: dateStr1,
        inicio: '08:00',
        fim: '09:00',
        recurso: 'Studio Pilates - Sala A',
        quantidade: 5,
        quantidade_utilizada: 1,
        prof: profUser.id,
        org: org1.id,
      },
      {
        data: dateStr1,
        inicio: '10:00',
        fim: '11:00',
        recurso: 'Fisioterapia Esportiva - Box 1',
        quantidade: 4,
        quantidade_utilizada: 2,
        prof: profUser.id,
        org: org1.id,
      },
      {
        data: dateStr1,
        inicio: '14:00',
        fim: '15:00',
        recurso: 'Reabilitação Postural - Sala B',
        quantidade: 6,
        quantidade_utilizada: 0,
        prof: profUser.id,
        org: org1.id,
      },
      {
        data: dateStr1,
        inicio: '17:00',
        fim: '18:00',
        recurso: 'Treinamento Funcional',
        quantidade: 8,
        quantidade_utilizada: 3,
        prof: profUser.id,
        org: org1.id,
      },

      {
        data: dateStr2,
        inicio: '09:00',
        fim: '10:00',
        recurso: 'Studio Pilates - Sala A',
        quantidade: 5,
        quantidade_utilizada: 0,
        prof: profUser.id,
        org: org1.id,
      },
      {
        data: dateStr2,
        inicio: '11:00',
        fim: '12:00',
        recurso: 'Fisioterapia Esportiva - Box 2',
        quantidade: 4,
        quantidade_utilizada: 1,
        prof: profUser.id,
        org: org1.id,
      },
      {
        data: dateStr2,
        inicio: '16:00',
        fim: '17:00',
        recurso: 'Musculação Acompanhada',
        quantidade: 10,
        quantidade_utilizada: 4,
        prof: profUser.id,
        org: org1.id,
      },

      {
        data: dateStr3,
        inicio: '08:30',
        fim: '09:30',
        recurso: 'Studio Pilates Reformer',
        quantidade: 4,
        quantidade_utilizada: 0,
        prof: profUser.id,
        org: org2.id,
      },
      {
        data: dateStr3,
        inicio: '14:30',
        fim: '15:30',
        recurso: 'Fisioterapia Traumato-Ortopédica',
        quantidade: 3,
        quantidade_utilizada: 0,
        prof: profUser.id,
        org: org2.id,
      },
    ]

    for (const item of sampleSlots) {
      try {
        const existing = app.findRecordsByFilter(
          'slot',
          `id_organizacao = "${item.org}" && data = "${item.data}" && inicio = "${item.inicio}" && recurso = "${item.recurso}"`,
          '',
          1,
          0,
        )
        if (existing.length === 0) {
          const s = new Record(slotCol)
          s.set('id_organizacao', item.org)
          s.set('id_profissional', item.prof)
          s.set('data', item.data)
          s.set('inicio', item.inicio)
          s.set('fim', item.fim)
          s.set('recurso', item.recurso)
          s.set('quantidade', item.quantidade)
          s.set('quantidade_utilizada', item.quantidade_utilizada)
          s.set('ativo', true)
          app.save(s)
        }
      } catch (_) {}
    }
  },
  (app) => {
    // down migration
  },
)
