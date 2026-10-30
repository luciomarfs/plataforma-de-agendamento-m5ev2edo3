// pocketbase/hooks/agendamento.pb.js
// Endpoints REST de negócio para Agendamentos sob /backend/v1/
// Executados no servidor Skip Cloud com garantia de autenticação por token e transação atômica.
// ATENÇÃO: No PocketBase JSVM, cada callback roda em contexto isolado; todo helper deve ser declarado inline.

/**
 * Health check para monitoramento
 */
routerAdd('GET', '/backend/v1/health', (e) => {
  return e.json(200, {
    status: 'ok',
    message: 'Backend de agendamento ativo',
    timestamp: new Date().toISOString(),
  })
})

/**
 * POST /backend/v1/agendamentos
 * Cria um agendamento de forma atômica no servidor.
 */
routerAdd(
  'POST',
  '/backend/v1/agendamentos',
  (e) => {
    // Helper inline para verificar permissão administrativa
    function checkIsAdminOrStaff(app, userId, orgId) {
      try {
        const acessos = app.findRecordsByFilter('acesso', `id_usuario = "${userId}"`, '', 1, 0)
        if (acessos && acessos.length > 0) {
          const raw = acessos[0].getString('perfis')
          if (raw) {
            const perfis = JSON.parse(raw)
            if (Array.isArray(perfis)) {
              if (perfis.indexOf('admin') !== -1 || perfis.indexOf('gestor') !== -1) {
                return true
              }
            }
          }
        }
      } catch (_) {}

      try {
        const vinculos = app.findRecordsByFilter(
          'acessoeorganizacao',
          `id_usuario = "${userId}" && id_organizacao = "${orgId}"`,
          '',
          10,
          0,
        )
        for (let i = 0; i < vinculos.length; i++) {
          const papel = vinculos[i].getString('papel')
          if (papel === 'admin' || papel === 'gestor' || papel === 'profissional') {
            return true
          }
        }
      } catch (_) {}

      return false
    }

    const authRecord = e.auth
    if (!authRecord) {
      throw new UnauthorizedError('Autenticação necessária. Token inválido ou ausente.')
    }

    const body = e.requestInfo().body || {}
    const slotId = body.id_slot || body.slotId
    const targetUserId = body.id_usuario || body.userId || authRecord.id
    const orgId = body.id_organizacao || body.organizacaoId
    const observacao = body.observacao || ''

    if (!slotId) {
      throw new BadRequestError('Campo id_slot é obrigatório.')
    }

    // Se o targetUserId for diferente do usuário autenticado, somente admin/gestor da organização pode agendar para outro
    if (targetUserId !== authRecord.id) {
      const isStaff = checkIsAdminOrStaff(e.app, authRecord.id, orgId || '')
      if (!isStaff) {
        throw new ForbiddenError(
          'Você não tem permissão para realizar agendamentos para outro usuário.',
        )
      }
    }

    // 1. Buscar o slot
    let slot
    try {
      slot = e.app.findRecordById('slot', slotId)
    } catch (_) {
      throw new NotFoundError('Horário (slot) não encontrado.')
    }

    const slotOrgId = slot.getString('id_organizacao')
    const finalOrgId = orgId || slotOrgId

    if (slotOrgId !== finalOrgId) {
      throw new BadRequestError('A organização informada não corresponde ao horário do slot.')
    }

    const isSlotAtivo = slot.getBool('ativo')
    if (!isSlotAtivo) {
      throw new BadRequestError('Este horário não está ativo para agendamento.')
    }

    const capacidadeTotal = slot.getInt('quantidade')
    const ocupadas = slot.getInt('quantidade_utilizada')
    if (ocupadas >= capacidadeTotal) {
      throw new BadRequestError('Slot lotado. Não há vagas disponíveis para esta sessão.')
    }

    const slotData = slot.getString('data') // YYYY-MM-DD

    // 2. Verificar se o usuário já possui agendamento confirmado neste mesmo slot
    try {
      const jaAgendado = e.app.findRecordsByFilter(
        'agendamento',
        `id_slot = "${slotId}" && id_usuario = "${targetUserId}" && status = "agendado"`,
        '',
        1,
        0,
      )
      if (jaAgendado && jaAgendado.length > 0) {
        throw new BadRequestError('Você já possui um agendamento confirmado para este horário.')
      }
    } catch (err) {
      if (err instanceof BadRequestError) throw err
    }

    // 3. Buscar contrato ativo do usuário na organização
    let contratos = []
    try {
      contratos = e.app.findRecordsByFilter(
        'contrato',
        `id_usuario = "${targetUserId}" && id_organizacao = "${finalOrgId}" && ativo = true`,
        '-created',
        5,
        0,
      )
    } catch (_) {}

    if (!contratos || contratos.length === 0) {
      throw new BadRequestError(
        'Nenhum contrato ativo encontrado para esta organização. Solicite a liberação do seu plano.',
      )
    }

    const contrato = contratos[0]
    const saldoAtual = contrato.getInt('saldo_slots')
    if (saldoAtual <= 0) {
      throw new BadRequestError('Sem saldo disponível. Saldo de slots esgotado no seu plano.')
    }

    // 4. Validar limites de uso por dia, semana e mês (se configurados no contrato)
    const limiteDia = contrato.getInt('slots_por_dia')
    const limiteSemana = contrato.getInt('slots_por_semana')
    const limiteMes = contrato.getInt('slots_por_mes')

    if (limiteDia > 0 || limiteSemana > 0 || limiteMes > 0) {
      const agendamentosExistentes = e.app.findRecordsByFilter(
        'agendamento',
        `id_usuario = "${targetUserId}" && id_organizacao = "${finalOrgId}" && status = "agendado"`,
        '',
        200,
        0,
      )

      let countDia = 0
      let countSemana = 0
      let countMes = 0

      const parts = slotData.split('-')
      const targetYear = Number(parts[0])
      const targetMonth = Number(parts[1])
      const targetDay = Number(parts[2])
      const targetDate = new Date(targetYear, targetMonth - 1, targetDay)

      const dayOfWeek = targetDate.getDay() // 0 = Domingo
      const startOfWeek = new Date(targetDate)
      startOfWeek.setDate(targetDate.getDate() - dayOfWeek)
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      const targetMonthYear = `${parts[0]}-${parts[1]}`

      for (let i = 0; i < agendamentosExistentes.length; i++) {
        const ag = agendamentosExistentes[i]
        const agSlotId = ag.getString('id_slot')
        try {
          const sRecord = e.app.findRecordById('slot', agSlotId)
          const sData = sRecord.getString('data')

          if (sData === slotData) {
            countDia++
          }

          if (sData.indexOf(targetMonthYear) === 0) {
            countMes++
          }

          const sParts = sData.split('-')
          const sDate = new Date(Number(sParts[0]), Number(sParts[1]) - 1, Number(sParts[2]))
          if (sDate >= startOfWeek && sDate <= endOfWeek) {
            countSemana++
          }
        } catch (_) {}
      }

      if (limiteDia > 0 && countDia >= limiteDia) {
        throw new BadRequestError(
          `Limite diário atingido. Seu plano permite até ${limiteDia} agendamento(s) por dia.`,
        )
      }
      if (limiteSemana > 0 && countSemana >= limiteSemana) {
        throw new BadRequestError(
          `Limite semanal atingido. Seu plano permite até ${limiteSemana} agendamento(s) por semana.`,
        )
      }
      if (limiteMes > 0 && countMes >= limiteMes) {
        throw new BadRequestError(
          `Limite mensal atingido. Seu plano permite até ${limiteMes} agendamento(s) por mês.`,
        )
      }
    }

    // 5. Execução atômica via transação
    let createdAgendamento
    let updatedSlot
    let updatedContrato

    e.app.runInTransaction((txApp) => {
      const currentSlot = txApp.findRecordById('slot', slotId)
      const currentOcupadas = currentSlot.getInt('quantidade_utilizada')
      const currentCapacidade = currentSlot.getInt('quantidade')

      if (currentOcupadas >= currentCapacidade) {
        throw new BadRequestError('Slot lotado. A vaga acabou de ser preenchida por outro usuário.')
      }

      const currentContrato = txApp.findRecordById('contrato', contrato.id)
      const currentSaldo = currentContrato.getInt('saldo_slots')
      if (currentSaldo <= 0) {
        throw new BadRequestError('Sem saldo disponível no contrato.')
      }

      const agendamentoCol = txApp.findCollectionByNameOrId('agendamento')
      const newAg = new Record(agendamentoCol)
      newAg.set('id_slot', slotId)
      newAg.set('id_usuario', targetUserId)
      newAg.set('id_organizacao', finalOrgId)
      newAg.set('status', 'agendado')
      newAg.set('observacao', observacao)
      txApp.save(newAg)
      createdAgendamento = newAg

      currentSlot.set('quantidade_utilizada', currentOcupadas + 1)
      txApp.save(currentSlot)
      updatedSlot = currentSlot

      currentContrato.set('saldo_slots', Math.max(0, currentSaldo - 1))
      txApp.save(currentContrato)
      updatedContrato = currentContrato
    })

    // Expandir relações manualmente para resposta idêntica ao client SDK
    let expandProf = null
    try {
      const profId = updatedSlot.getString('id_profissional')
      if (profId) {
        const profRecord = e.app.findRecordById('users', profId)
        expandProf = {
          id: profRecord.id,
          name: profRecord.getString('name'),
          email: profRecord.getString('email'),
          phone: profRecord.getString('phone'),
        }
      }
    } catch (_) {}

    let expandOrg = null
    try {
      const orgRecord = e.app.findRecordById('organizacao', finalOrgId)
      expandOrg = {
        id: orgRecord.id,
        nome: orgRecord.getString('nome'),
        codigo: orgRecord.getString('codigo'),
        telefone: orgRecord.getString('telefone'),
        endereco: orgRecord.getString('endereco'),
      }
    } catch (_) {}

    const slotPayload = {
      id: updatedSlot.id,
      id_organizacao: updatedSlot.getString('id_organizacao'),
      id_profissional: updatedSlot.getString('id_profissional'),
      data: updatedSlot.getString('data'),
      inicio: updatedSlot.getString('inicio'),
      fim: updatedSlot.getString('fim'),
      recurso: updatedSlot.getString('recurso'),
      quantidade: updatedSlot.getInt('quantidade'),
      quantidade_utilizada: updatedSlot.getInt('quantidade_utilizada'),
      ativo: updatedSlot.getBool('ativo'),
      expand: {
        id_profissional: expandProf,
        id_organizacao: expandOrg,
      },
    }

    const agendamentoPayload = {
      id: createdAgendamento.id,
      id_slot: createdAgendamento.getString('id_slot'),
      id_usuario: createdAgendamento.getString('id_usuario'),
      id_organizacao: createdAgendamento.getString('id_organizacao'),
      status: createdAgendamento.getString('status'),
      observacao: createdAgendamento.getString('observacao'),
      created: createdAgendamento.getString('created'),
      updated: createdAgendamento.getString('updated'),
      expand: {
        id_slot: slotPayload,
        id_organizacao: expandOrg,
      },
    }

    const contratoPayload = {
      id: updatedContrato.id,
      id_usuario: updatedContrato.getString('id_usuario'),
      id_organizacao: updatedContrato.getString('id_organizacao'),
      ativo: updatedContrato.getBool('ativo'),
      saldo_slots: updatedContrato.getInt('saldo_slots'),
      slots_por_dia: updatedContrato.getInt('slots_por_dia'),
      slots_por_semana: updatedContrato.getInt('slots_por_semana'),
      slots_por_mes: updatedContrato.getInt('slots_por_mes'),
      plano_nome: updatedContrato.getString('plano_nome'),
    }

    return e.json(200, {
      success: true,
      agendamento: agendamentoPayload,
      slot: slotPayload,
      contrato: contratoPayload,
    })
  },
  $apis.requireAuth(),
)

/**
 * POST /backend/v1/agendamentos/{id}/cancelar
 * Cancela um agendamento de forma atômica no servidor.
 */
routerAdd(
  'POST',
  '/backend/v1/agendamentos/{id}/cancelar',
  (e) => {
    // Helper inline para verificar permissão administrativa
    function checkIsAdminOrStaff(app, userId, orgId) {
      try {
        const acessos = app.findRecordsByFilter('acesso', `id_usuario = "${userId}"`, '', 1, 0)
        if (acessos && acessos.length > 0) {
          const raw = acessos[0].getString('perfis')
          if (raw) {
            const perfis = JSON.parse(raw)
            if (Array.isArray(perfis)) {
              if (perfis.indexOf('admin') !== -1 || perfis.indexOf('gestor') !== -1) {
                return true
              }
            }
          }
        }
      } catch (_) {}

      try {
        const vinculos = app.findRecordsByFilter(
          'acessoeorganizacao',
          `id_usuario = "${userId}" && id_organizacao = "${orgId}"`,
          '',
          10,
          0,
        )
        for (let i = 0; i < vinculos.length; i++) {
          const papel = vinculos[i].getString('papel')
          if (papel === 'admin' || papel === 'gestor' || papel === 'profissional') {
            return true
          }
        }
      } catch (_) {}

      return false
    }

    const authRecord = e.auth
    if (!authRecord) {
      throw new UnauthorizedError('Autenticação necessária. Token inválido ou ausente.')
    }

    const agendamentoId = e.request.pathValue('id')
    if (!agendamentoId) {
      throw new BadRequestError('ID do agendamento não informado na URL.')
    }

    let agendamento
    try {
      agendamento = e.app.findRecordById('agendamento', agendamentoId)
    } catch (_) {
      throw new NotFoundError('Agendamento não encontrado.')
    }

    const donoId = agendamento.getString('id_usuario')
    const orgId = agendamento.getString('id_organizacao')
    const slotId = agendamento.getString('id_slot')
    const statusAtual = agendamento.getString('status')

    // Verificação de permissão: dono ou admin/gestor/profissional
    if (authRecord.id !== donoId) {
      const isStaff = checkIsAdminOrStaff(e.app, authRecord.id, orgId)
      if (!isStaff) {
        throw new ForbiddenError(
          'Apenas o dono do agendamento ou a equipe da organização pode cancelá-lo.',
        )
      }
    }

    // Se já estiver cancelado, retorno idempotente
    if (statusAtual === 'cancelado') {
      return e.json(200, {
        success: true,
        message: 'Agendamento já estava cancelado.',
        agendamento: {
          id: agendamento.id,
          id_slot: slotId,
          id_usuario: donoId,
          id_organizacao: orgId,
          status: 'cancelado',
        },
      })
    }

    // Execução atômica do cancelamento e estorno
    let updatedAgendamento
    let updatedSlot = null

    e.app.runInTransaction((txApp) => {
      // 1. Atualizar agendamento
      const currentAg = txApp.findRecordById('agendamento', agendamentoId)
      currentAg.set('status', 'cancelado')
      txApp.save(currentAg)
      updatedAgendamento = currentAg

      // 2. Liberar capacidade no slot
      if (slotId) {
        try {
          const currentSlot = txApp.findRecordById('slot', slotId)
          const ocupadas = currentSlot.getInt('quantidade_utilizada')
          currentSlot.set('quantidade_utilizada', Math.max(0, ocupadas - 1))
          txApp.save(currentSlot)
          updatedSlot = currentSlot
        } catch (_) {}
      }

      // 3. Estornar saldo no contrato ativo do usuário
      try {
        const contratos = txApp.findRecordsByFilter(
          'contrato',
          `id_usuario = "${donoId}" && id_organizacao = "${orgId}" && ativo = true`,
          '-created',
          1,
          0,
        )
        if (contratos && contratos.length > 0) {
          const currentContrato = contratos[0]
          const saldo = currentContrato.getInt('saldo_slots')
          currentContrato.set('saldo_slots', saldo + 1)
          txApp.save(currentContrato)
        }
      } catch (_) {}
    })

    // Montar expansões para a resposta
    let expandSlot = null
    if (slotId) {
      try {
        const s = updatedSlot || e.app.findRecordById('slot', slotId)
        expandSlot = {
          id: s.id,
          recurso: s.getString('recurso'),
          data: s.getString('data'),
          inicio: s.getString('inicio'),
          fim: s.getString('fim'),
          quantidade: s.getInt('quantidade'),
          quantidade_utilizada: s.getInt('quantidade_utilizada'),
        }
      } catch (_) {}
    }

    let expandOrg = null
    try {
      const o = e.app.findRecordById('organizacao', orgId)
      expandOrg = {
        id: o.id,
        nome: o.getString('nome'),
        telefone: o.getString('telefone'),
      }
    } catch (_) {}

    return e.json(200, {
      success: true,
      message: 'Agendamento cancelado com sucesso. Vaga e saldo estornados.',
      agendamento: {
        id: updatedAgendamento.id,
        id_slot: slotId,
        id_usuario: donoId,
        id_organizacao: orgId,
        status: 'cancelado',
        observacao: updatedAgendamento.getString('observacao'),
        expand: {
          id_slot: expandSlot,
          id_organizacao: expandOrg,
        },
      },
    })
  },
  $apis.requireAuth(),
)
