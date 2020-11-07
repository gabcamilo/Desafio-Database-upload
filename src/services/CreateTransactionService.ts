import { getRepository } from 'typeorm';

// import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);

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
}

export default CreateTransactionService;
