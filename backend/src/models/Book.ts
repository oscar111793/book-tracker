import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { BookStatus } from '../types';

/**
 * Book Model Attributes Interface
 * Defines the structure of Book model attributes
 */
interface BookAttributes {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  createdAt: Date;
  rating: number;
}

/**
 * Book Creation Attributes
 * Attributes required when creating a new book (id and createdAt are auto-generated)
 */
interface BookCreationAttributes extends Optional<BookAttributes, 'id' | 'createdAt' | 'rating'> {}

/**
 * Book Model Class
 * Sequelize model representing the books table
 */
class Book extends Model<BookAttributes, BookCreationAttributes> implements BookAttributes {
  public id!: number;
  public title!: string;
  public author!: string;
  public status!: BookStatus;
  public createdAt!: Date;
  public rating!: number;
}

/**
 * Initialize Book Model
 * Defines the table structure and constraints
 * Must be called after sequelize instance is created
 */
export const initializeBookModel = (sequelizeInstance: Sequelize): typeof Book => {
  Book.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('READ', 'UNREAD'),
        allowNull: false,
        defaultValue: 'UNREAD',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 5,
        },
      },
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'books',
      timestamps: false, // We use createdAt manually
      underscored: false,
    }
  );

  return Book;
};

export default Book;

