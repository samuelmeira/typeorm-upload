import { EntityRepository, Repository } from 'typeorm';

import Category from '../models/Category';


@EntityRepository(Category)
class CategoriesRepository extends Repository<Category> {
  public async findOrCreate(title: string): Promise<Category>{
    const category = await this.findOne({
      where: { title }
    });

    if (!category) {
      const newCategory = this.create({title: title});
      await this.save(newCategory);
      return newCategory;
    }

    return category;
  }
}

export default CategoriesRepository;
