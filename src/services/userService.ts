import pb from '@/lib/pocketbase/client'
import { Acesso, AcessoEOrganizacao, User, UserRole } from '@/domain/models'

export const userService = {
  async getAllUsers(): Promise<User[]> {
    return await pb.collection('users').getFullList<User>({
      sort: 'name',
    })
  },

  async getAcessoByUserId(userId: string): Promise<Acesso | null> {
    try {
      const acesso = await pb
        .collection('acesso')
        .getFirstListItem<Acesso>(`id_usuario = "${userId}"`)
      if (typeof acesso.perfis === 'string') {
        try {
          acesso.perfis = JSON.parse(acesso.perfis)
        } catch {
          acesso.perfis = ['usuario']
        }
      }
      return acesso
    } catch {
      return null
    }
  },

  async setPerfis(userId: string, perfis: UserRole[]): Promise<Acesso> {
    const existing = await this.getAcessoByUserId(userId)
    if (existing) {
      return await pb.collection('acesso').update<Acesso>(existing.id, {
        perfis: JSON.stringify(perfis),
      })
    } else {
      return await pb.collection('acesso').create<Acesso>({
        id_usuario: userId,
        perfis: JSON.stringify(perfis),
      })
    }
  },

  async getVinculosByUserId(userId: string): Promise<AcessoEOrganizacao[]> {
    return await pb.collection('acessoeorganizacao').getFullList<AcessoEOrganizacao>({
      filter: `id_usuario = "${userId}"`,
      expand: 'id_organizacao,id_usuario',
    })
  },

  async getAllVinculos(): Promise<AcessoEOrganizacao[]> {
    return await pb.collection('acessoeorganizacao').getFullList<AcessoEOrganizacao>({
      expand: 'id_organizacao,id_usuario',
      sort: '-created',
    })
  },

  async addVinculo(
    userId: string,
    orgId: string,
    papel: 'admin' | 'profissional' | 'membro' = 'profissional',
  ): Promise<AcessoEOrganizacao> {
    // Check if already exists
    try {
      const existing = await pb
        .collection('acessoeorganizacao')
        .getFirstListItem<AcessoEOrganizacao>(
          `id_usuario = "${userId}" && id_organizacao = "${orgId}"`,
        )
      if (existing) {
        return await pb
          .collection('acessoeorganizacao')
          .update<AcessoEOrganizacao>(existing.id, { papel })
      }
    } catch {
      /* intentionally ignored */
    }

    return await pb.collection('acessoeorganizacao').create<AcessoEOrganizacao>(
      {
        id_usuario: userId,
        id_organizacao: orgId,
        papel,
        assigned_at: new Date().toISOString(),
      },
      {
        expand: 'id_organizacao,id_usuario',
      },
    )
  },

  async removeVinculo(vinculoId: string): Promise<boolean> {
    return await pb.collection('acessoeorganizacao').delete(vinculoId)
  },
}
