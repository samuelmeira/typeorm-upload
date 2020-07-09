import { getCustomRepository, getRepository } from 'typeorm'
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import CategoriesRepository from '../repositories/CategoriesRepository';

interface Request {
  title: string,
  value: number,
  type: 'income' | 'outcome',
  category: string,
}
class CreateTransactionService {
  public async execute({ title, value, type, category }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);
    const balance = await transactionsRepository.getBalance();

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('O tipo da transação deve ser income ou outcome.')
    }
    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Valor em caixa inferior ao outcome.')
    }

    const findedCategory = await categoriesRepository.findOrCreate(category);

    const transaction = transactionsRepository.create({ title, value, type, category: findedCategory });
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
