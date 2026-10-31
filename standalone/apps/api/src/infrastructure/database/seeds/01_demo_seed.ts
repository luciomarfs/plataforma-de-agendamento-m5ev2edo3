import type { Knex } from 'knex'
import bcrypt from 'bcrypt'

export async function seed(knex: Knex): Promise<void> {
  // Limpar tabelas mantendo integridade
  await knex('agendamento').del()
  await knex('contrato').del()
  await knex('slot').del()
  await knex('acessoeorganizacao').del()
  await knex('organizacao').del()
  await knex('acesso').del()
  await knex('usuario').del()

  const passwordHash = await bcrypt.hash('12345678', 10)

  // 1. Organizações Demo
  const orgBioFitId = '11111111-1111-4111-8111-111111111111'
  const orgPilatesJardinsId = '22222222-2222-4222-8222-222222222222'

  await knex('organizacao').insert([
    {
      id_organizacao: orgBioFitId,
      codigo: 'BIOFIT01',
      nome: 'BioFit Premium Moema',
      descricao: 'Centro avançado de treinamento, musculação e recovery muscular.',
      telefone: '+55 11 98888-7777',
      endereco: 'Av. Moema, 450 - Moema, São Paulo - SP',
    },
    {
      id_organizacao: orgPilatesJardinsId,
      codigo: 'STUDIO02',
      nome: 'Studio Fisio & Pilates Jardins',
      descricao:
        'Studio boutique focado em reabilitação postural, fisioterapia e pilates clássico.',
      telefone: '+55 11 97777-6666',
      endereco: 'Rua Oscar Freire, 1200 - Jardins, São Paulo - SP',
    },
  ])

  // 2. Usuários Demo
  const adminId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  const profCarlosId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
  const profJulianaId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
  const alunoDemoId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'

  await knex('usuario').insert([
    {
      id: adminId,
      name: 'Administrador BioFit',
      email: 'admin@biofit.com.br',
      password: passwordHash,
      email_verified: new Date(),
    },
    {
      id: profCarlosId,
      name: 'Dr. Carlos Eduardo (Fisioterapeuta)',
      email: 'carlos.fisioterapia@biofit.com.br',
      password: passwordHash,
      email_verified: new Date(),
    },
    {
      id: profJulianaId,
      name: 'Dra. Juliana Mendes (Pilates)',
      email: 'juliana.pilates@jardins.com.br',
      password: passwordHash,
      email_verified: new Date(),
    },
    {
      id: alunoDemoId,
      name: 'Mariana Silva (Aluna)',
      email: 'mariana.silva@gmail.com',
      password: passwordHash,
      email_verified: new Date(),
    },
  ])

  // 3. Perfis na tabela acesso
  await knex('acesso').insert([
    { id_usuario: adminId, perfis: '{admin,gestor}' },
    { id_usuario: profCarlosId, perfis: '{profissional}' },
    { id_usuario: profJulianaId, perfis: '{profissional}' },
    { id_usuario: alunoDemoId, perfis: '{usuario}' },
  ])

  // 4. Vínculos de organizações (acessoeorganizacao)
  await knex('acessoeorganizacao').insert([
    { id_usuario: adminId, id_organizacao: orgBioFitId, papel: 'admin' },
    { id_usuario: adminId, id_organizacao: orgPilatesJardinsId, papel: 'admin' },
    { id_usuario: profCarlosId, id_organizacao: orgBioFitId, papel: 'profissional' },
    { id_usuario: profJulianaId, id_organizacao: orgPilatesJardinsId, papel: 'profissional' },
  ])

  // 5. Contrato do Aluno Demo na BioFit
  const contratoId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'
  await knex('contrato').insert({
    id_contrato: contratoId,
    id_usuario: alunoDemoId,
    id_organizacao: orgBioFitId,
    ativo: true,
    data_inicio: '2025-01-01',
    data_fim: '2025-12-31',
    slots_por_dia: 2,
    slots_por_semana: 4,
    slots_por_mes: 16,
    saldo_slots: 10,
    plano_nome: 'Plano Black VIP - Acesso Total',
  })

  // 6. Slots com capacidade
  const hoje = new Date().toISOString().split('T')[0]
  const slot1Id = 'ffffffff-ffff-4fff-8fff-ffffffffffff'
  const slot2Id = '12345678-1234-4234-8234-1234567890ab'

  await knex('slot').insert([
    {
      id_slot: slot1Id,
      id_organizacao: orgBioFitId,
      id_profissional: profCarlosId,
      data: hoje,
      inicio: '08:00:00',
      fim: '09:00:00',
      recurso: 'Sessão Fisioterapia & Recovery',
      quantidade: 5,
      quantidade_utilizada: 1,
      ativo: true,
    },
    {
      id_slot: slot2Id,
      id_organizacao: orgBioFitId,
      id_profissional: profCarlosId,
      data: hoje,
      inicio: '09:00:00',
      fim: '10:00:00',
      recurso: 'Sessão Fisioterapia & Recovery',
      quantidade: 4,
      quantidade_utilizada: 0,
      ativo: true,
    },
  ])

  // 7. Agendamento inicial do aluno
  await knex('agendamento').insert({
    id_agendamento: '99999999-9999-4999-8999-999999999999',
    id_slot: slot1Id,
    id_usuario: alunoDemoId,
    id_organizacao: orgBioFitId,
    status: 'agendado',
    observacao: 'Foco em fortalecimento de joelho direito',
  })

  console.log(
    '✅ Seed executado com sucesso: BioFit Moema, Studio Jardins, usuários e slots demo criados.',
  )
}
