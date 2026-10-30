export class DomainError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'DomainError';
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Não autorizado. Faça login para continuar.') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Acesso negado para esta operação.') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Recurso não encontrado.') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}
