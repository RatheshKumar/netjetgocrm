// modules/erp/services/product.service.js
const productRepo = require('../repositories/product.repository');
const { v4: uuid } = require('uuid');

class ProductService {
  async listProducts() {
    return await productRepo.getAll();
  }

  async getProduct(id) {
    return await productRepo.getById(id);
  }

  async addProduct(data) {
    const id = uuid();
    await productRepo.create({
      id,
      name: data.name,
      sku: data.sku,
      stock: data.stock || 0,
      price: data.price || 0
    });
    return { id, ...data };
  }

  // Inter-module service method: CRM might call this to check stock for a customer
  async checkAvailability(id, quantity) {
    const product = await productRepo.getById(id);
    return product && product.stock >= quantity;
  }
}

module.exports = new ProductService();
