import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface ValidationDTO {
  value: number;
  type: 'income' | 'outcome';
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    await this.validateTransaction({ value, type }, transactionsRepository);

    let categoryData = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryData) {
      categoryData = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryData);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryData.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }

  private async validateTransaction(
    { value, type }: ValidationDTO,
    repository: TransactionRepository,
  ): Promise<void> {
    if (type === 'income') {
      return;
    }

    const balance = await repository.getBalance();

    if (balance.total - value < 0) {
      throw new AppError('Invalid balance', 400);
    }
  }
}

export default CreateTransactionService;
