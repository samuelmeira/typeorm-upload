import AppError from '../errors/AppError';
import { getRepository } from 'typeorm'

import Transaction from '../models/Transaction';
class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    // TODO
    const transactionsRepository = getRepository(Transaction);

    const findedTransaction = await transactionsRepository.findOne(id);

    if (!findedTransaction) {
      throw new AppError('Transação não encontrada.', 404);
    }

    transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
