import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions?: Array<Transaction>): Promise<Balance> {
    const transactionsArray = transactions || (await this.find());
    const reducer = (acc: number, cur: number): number => acc + cur;

    const income = transactionsArray
      .filter(transaction => transaction.type === 'income')
      .map(incomeItem => Number(incomeItem.value))
      .reduce(reducer, 0);

    const outcome = transactionsArray
      .filter(transaction => transaction.type === 'outcome')
      .map(outcomeItem => Number(outcomeItem.value))
      .reduce(reducer, 0);

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }
}

export default TransactionsRepository;
