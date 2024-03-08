'use strict'

import { checkDates, dataProduct } from '../../utils/validations.js'
import Product from './product.model.js'
import Category from '../category/category.model.js'

export const createProduct = async (req, res) => {
    try {
        let data = req.body
        if (isNaN(data.stock) || isNaN(data.price)) return res.status(400).send({ message: 'Stock and price only numbers allowed' })
        if (parseFloat(data.stock) < 1 || parseFloat(data.price) < 1) return res.status(400).send({ message: 'Stock and price cannot be negative or less than one' })
        const query = [{ path: 'category' }]
        const required = ['name', 'description', 'price', 'stock', 'category']
        let missingData = required.filter(field => !data[field] || data[field].replaceAll(' ', '').length === 0)
        if (missingData.length > 0) return res.status(400).send({ message: `Missing required fields ${missingData.join(', ')}` })
        let productExist = await Product.findOne({ $or: [{ name: data.name }, { description: data.description }] })
        if (productExist) return res.status(409).send({ message: 'Product o description already exist' })
        let category = await Category.findOne({ _id: data.category })
        if (!category) return res.status(404).send({ message: 'You enter a valid category' })
        data.stock = Math.floor(parseInt(data.stock))
        let product = new Product(data)
        await product.save()
        await product.populate(query)
        return res.send({ message: 'Product created successfully', product })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error creating product' })
    }
}

export const getProducts = async (req, res) => {
    try {
        let products = await Product.find({}).populate('category')
        if (products.length === 0) return res.status(404).send({ message: 'No existing products' })
        return res.send({ message: 'Products found', products })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting products' })
    }
}

export const searchProduct = async (req, res) => {
    try {
        let { name } = req.body
        let product = await Product.findOne({ name: name }).populate('category')
        if (!product) return res.status(404).send({ message: 'Product not found' })
        return res.send({ message: 'Product found', product })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching product' })
    }
}

export const updateProduct = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let product = dataProduct(data)
        if (!product) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        if (isNaN(data.price)) return res.status(400).send({ message: 'Price only numbers allowed' })
        if (parseFloat(data.price) < 1) return res.status(400).send({ message: 'Price cannot be negative or less than one' })
        let productExist = await Product.findOne({ $or: [{ name: data.name }, { description: data.description }] })
        if (productExist) return res.status(409).send({ message: 'Product o description already exist' })
        if (data.category) {
            let category = await Category.findOne({ _id: data.category })
            if (!category) return res.status(404).send({ message: 'You enter a valid category' })
        }
        let updateProduct = await Product.findOneAndUpdate({ _id: id }, data, { new: true }).populate('category')
        if (!updateProduct) return res.status(404).send({ message: 'Product not found, not updating' })
        return res.send({ message: 'Product updated successfully', updateProduct })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating product' })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        let { id } = req.params
        let product = await Product.findOneAndDelete({ _id: id }).populate('category')
        if (!product) return res.status(404).send({ message: 'Product not found, not deleted' })
        return res.send({ message: 'Product deleted successfully', product })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting product' })
    }
}

export const productsOutOfStock = async (req, res) => {
    try {
        let product = await Product.find({ stock: 0 }).populate('category')
        if (product.length === 0) return res.status(404).send({ message: 'No out of stock products found' })
        return res.send({ message: 'Products out of stock', product })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting products out of stock' })
    }
}

export const productsMostSold = async (req, res) => {
    try {
        let product = await Product.find({}).populate('category')
        if (product.length === 0) return res.status(404).send({ message: 'Best selling products not found' })
        product.sort((a, b) => {
            const order = { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 }
            return order[b.average] - order[a.average]
        })
        res.send({ message: 'Products most sold', product })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting most sold products' })
    }
}

export const productsByCategory = async (req, res) => {
    try {
        let { id } = req.params
        let product = await Product.find({ category: id }).populate('category')
        if (product.length === 0) return res.status(404).send({ message: 'Not found products with this category' })
        return res.send({ message: 'Products found with this category', product })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting products by category' })
    }
}

export const productByName = async (req, res) => {
    try {
        let { product } = req.body
        const regex = new RegExp(product, 'i')
        let getProduct = await Product.find({ name: regex }).populate('category')
        if (getProduct.length === 0) return res.status(404).send({ message: 'Error getting products' })
        return res.send({ message: 'Products found', getProduct })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting products by name category' })
    }
}