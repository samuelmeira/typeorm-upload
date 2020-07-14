import { getRepository, getCustomRepository, In } from 'typeorm'
import path from 'path';
import fs from 'fs';
import csvParse from 'csv-parse';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string,
  type: 'income' | 'outcome',
  value: number,
  category: string
}

class ImportTransactionsService {

  async execute(transactionsFilename: string): Promise<Transaction[]> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const csvFilePath = path.resolve(uploadConfig.directory, transactionsFilename);
    const readCSVStream = fs.createReadStream(csvFilePath);
    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', line => {
      const [ title, type, value, category ] = line.map((cell:string) => cell.trim());

      if (!title || !type || !value ) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise (resolve => {
      parseCSV.on('end', resolve);
    });

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      }
    })

    const existentCategoriesTitles = existentCategories.map((category: Category) => category.title )


    const addCategoryTitles = categories.filter(
      category => !existentCategoriesTitles.includes(category)
      ).filter((value, index, self) => self.indexOf(value) === index );

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map( title => ({ title }))
    )

    await categoriesRepository.save(newCategories)

    const finalCategories = [ ...newCategories, ...existentCategories];
    const createdTransactions = transactionsRepository.create(
      transactions.map( transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      }))
    )

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(csvFilePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
