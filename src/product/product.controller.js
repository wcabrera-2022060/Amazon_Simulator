'use strict'

import { checkDates, dataProduct } from '../../utils/validations.js'
import Product from './product.model.js'

export const createProduct = async(req, res) => {
    try {
    let data = req.body
    let product = new Product(data)
    if(!product) return res.status(400).send({message: 'Missing data, not created'})
    let productExist = await Product.findOne({$or: [{name: data.name},{description: data.description}]})
    if(productExist) return res.status(409).send({message: 'Product o description already exist'})
    await product.save()
    return res.send({message: 'Product created successfully', product})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error creating product'})
    }
}//*Falta devolver con populate

export const getProducts = async(req, res) => {
    try {
        let products = await Product.find({}).populate('category')
        if(!products) return res.status(404).send({message: 'No existing products'})
        return res.send({products})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error getting products'})
    }
}

export const searchProduct = async(req, res) => {
    try {
    let {id} = req.params
    let product = await Product.findOne({_id: id}).populate('category')
    if(!product) return res.status(404).send({message: 'Product not found'})
    return res.send({message: 'Product found', product})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error searching product'})
    }
}

export const updateProduct = async(req, res) => {
    try {
    let {id} = req.params
    let data = req.body
    let product = dataProduct(data)
    if(!product) return res.status(400).send({message: 'Have submitted some data that cannot be updated or missing data'})
    let updateProduct = await Product.findOneAndUpdate({_id: id}, data, {new: true}).populate('category')
    if(!updateProduct) return res.status(404).send({message: 'Product not found, not updating'})
    return res.send({message: 'Product updated successfully', updateProduct})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error updating product'})
    }
}

export const deleteProduct = async(req, res) => {
    try {
    let {id} = req.params
    let product = await Product.findOneAndDelete({_id: id}).populate('category')
    if(!product) return res.status(404).send({message: 'Product not found, not deleted'})
    return res.send({message: 'Product deleted successfully', product})
    } catch (error) {
        console.error(error)
        return res.status(500).send({message: 'Error deleting product'})
    }
}