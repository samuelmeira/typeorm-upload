import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const incomeValues =  transactions.map(transaction => (
      transaction.type === 'income' ? transaction.value : 0
    ));

    const incomeValue = incomeValues.reduce((previus, currentValue) => (
      previus + currentValue
    ), 0);

    const outcomeValues = transactions.map(transaction => (
      transaction.type === 'outcome' ? transaction.value : 0
    ));

    const outcomeValue = outcomeValues.reduce((previus, currentValue) => (
      previus + currentValue
    ), 0);

    const balance = {
      income: incomeValue,
      outcome: outcomeValue,
      total: (incomeValue - outcomeValue),
    }
    return balance;
  }
}

export default TransactionsRepository;
