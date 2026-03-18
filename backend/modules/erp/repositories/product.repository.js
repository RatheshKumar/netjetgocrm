// modules/erp/repositories/product.repository.js
const pool = require('../../../config/db');

class ProductRepository {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM erp_products');
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM erp_products WHERE id = ?', [id]);
    return rows[0];
  }

  async create(product) {
    const { id, name, sku, stock, price } = product;
    const sql = 'INSERT INTO erp_products (id, name, sku, stock, price) VALUES (?, ?, ?, ?, ?)';
    await pool.query(sql, [id, name, sku, stock, price]);
  }

  async updateStock(id, newStock) {
    await pool.query('UPDATE erp_products SET stock = ? WHERE id = ?', [newStock, id]);
  }
}

module.exports = new ProductRepository();
