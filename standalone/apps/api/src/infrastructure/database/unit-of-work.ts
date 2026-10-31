import type { Knex } from 'knex'
import { IUnitOfWork } from '../../domain/repositories/interfaces.js'

export class KnexUnitOfWork implements IUnitOfWork {
  constructor(private knex: Knex) {}

  async startTransaction<T>(work: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
    return this.knex.transaction(async (trx) => {
      return work(trx)
    })
  }
}
