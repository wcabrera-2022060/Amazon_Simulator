'use strict'

import Shopping from './shopping.model.js'
import Product from '../product/product.model.js'
import Invoice from '../invoice/invoice.model.js'

export const createShopping = async (req, res) => {
    try {
        let { _id } = req.user
        let data = req.body
        data.user = _id
        let verifyShopping = await Shopping.find({ user: _id })
        let shoppingIds = verifyShopping.map(shopping => shopping._id)
        for (const shoppingId of shoppingIds) {
            let invoice = await Invoice.findOne({ shopping: shoppingId })
            if (!invoice) {
                req.params.id = shoppingId
                return addProductShopping(req, res)
            }
        }
        const required = ['product', 'quantity']
        let missingData = required.filter(field => !data[field] || data[field].replaceAll(' ', '').length === 0)
        if (missingData.length > 0) return res.status(400).send({ message: `Missing required fields ${missingData.join(', ')}` })
        if (isNaN(data.quantity)) return res.status(400).send({ message: 'Quantity must be a number' })
        let product = await Product.findOne({ _id: data.product })
        if (!product) return res.status(404).send({ message: 'Product not found, enter a valid product' })
        if (parseInt(data.quantity) > product.stock) return res.status(418).send({ message: 'Product cannot be added, it exceeds stock' })
        let stock = product.stock - parseInt(data.quantity)
        await Product.findOneAndUpdate({ _id: data.product }, { stock: stock }, { new: true })
        let subTotal = parseFloat(product.price) * parseInt(data.quantity)
        data.subTotal = subTotal
        let products = {
            product: data.product,
            quantity: data.quantity
        }
        data.products = [products]
        let shopping = new Shopping(data)
        await shopping.save()
        const query = [{ path: 'user', select: '-password' }, { path: 'products.product', populate: { path: 'category' } }]
        await shopping.populate(query)
        return res.send({ message: 'Shopping created successfully', shopping })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error creating Shopping' })
    }
}

export const addProductShopping = async (req, res) => {
    try {
        let { _id } = req.user
        let { id } = req.params
        let data = req.body
        let invoice = await Invoice.findOne({ shopping: id })
        if (invoice) return res.status(401).send({ message: 'You cannot add more products, the purchase has already been made' })
        let shopping = await Shopping.findOne({ _id: id })
        if (!shopping) return res.status(404).send({ message: 'Shopping not found' })
        if (shopping.user.toString() !== _id.toString()) return res.status(401).send({ message: 'You cannot add products to a purchase that you do not want' })
        const required = ['product', 'quantity']
        let missingData = required.filter(field => !data[field] || data[field].replaceAll(' ', '').length === 0)
        if (missingData.length > 0) return res.status(400).send({ message: `Missing required fields ${missingData.join(', ')}` })
        if (isNaN(data.quantity)) return res.status(400).send({ message: 'Quantity must be a number' })
        let product = await Product.findOne({ _id: data.product })
        if (!product) return res.status(404).send({ message: 'Product not found, enter a valid product' })
        let productExist = shopping.products.find(item => item.product.toString() === data.product)
        if (productExist) {
            productExist.quantity += parseInt(data.quantity)
            shopping.subTotal += parseFloat(product.price) * parseInt(data.quantity)
        } else {
            shopping.products.push({
                product: data.product,
                quantity: data.quantity
            })
            shopping.subTotal += parseFloat(product.price) * parseInt(data.quantity)
        }
        if (parseInt(data.quantity) > product.stock) return res.status(418).send({ message: 'Product cannot be added, it exceeds stock' })
        let stock = product.stock - parseInt(data.quantity)
        await Product.findOneAndUpdate({ _id: data.product }, { stock: stock }, { new: true })
        await shopping.save()
        const query = [{ path: 'user', select: '-password' }, { path: 'products.product', populate: { path: 'category' } }]
        let add = await Shopping.findOne({ _id: id }).populate(query)
        if (!add) return res.status(404).send({ message: 'No products added' })
        return res.send({ message: 'Products added to shopping', add })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error adding product to shopping' })
    }
}

export const removeProductShopping = async (req, res) => {
    try {
        let { _id } = req.user
        let { id } = req.params
        let data = req.body
        let invoice = await Invoice.findOne({ shopping: id })
        if (invoice) return res.status(401).send({ message: 'You cannot remove products, the purchase has already been made' })
        let shopping = await Shopping.findOne({ _id: id })
        if (!shopping) return res.status(404).send({ message: 'Shopping not found' })
        if (shopping.user.toString() !== _id.toString()) return res.status(401).send({ message: 'You cannot remove products to a purchase that you do not want' })
        const required = ['product', 'quantity']
        let missingData = required.filter(field => !data[field] || data[field].replaceAll(' ', '').length === 0)
        if (missingData.length > 0) return res.status(400).send({ message: `Missing required fields ${missingData.join(', ')}` })
        if (isNaN(data.quantity)) return res.status(400).send({ message: 'quantity must be a number' })
        let product = await Product.findOne({ _id: data.product })
        if (!product) return res.status(404).send({ message: 'Product not found, enter a valid product' })
        let productExist = shopping.products.find(item => item.product.toString() === data.product)
        if (productExist) {
            if (parseInt(data.quantity) > productExist.quantity) return res.status(400).send({ message: 'Cannot remove more quantity than available in shopping' })
            productExist.quantity -= parseInt(data.quantity)
            if (productExist.quantity === 0) {
                shopping.products = shopping.products.filter(item => item.product.toString() !== data.product)
            }
            shopping.subTotal -= parseFloat(product.price) * parseInt(data.quantity)
        } else return res.status(404).send({ message: 'The product to be canceled is not found in the shopping' })
        let stock = product.stock + parseInt(data.quantity)
        await Product.findOneAndUpdate({ _id: data.product }, { stock: stock }, { new: true })
        await shopping.save()
        const query = [{ path: 'user', select: '-password' }, { path: 'products.product', populate: { path: 'category' } }]
        let add = await Shopping.findOne({ _id: id }).populate(query)
        if (!add) return res.status(404).send({ message: 'No products in shopping' })
        return res.send({ message: 'Products removed to shopping', add })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error removing product to shopping' })
    }
}

export const historyShopping = async (req, res) => {
    try {
        let { _id } = req.user
        const query = [{ path: 'user', select: '-password' }, { path: 'products.product', populate: { path: 'category' } }]
        let history = await Shopping.find({ user: _id }).populate(query)
        if (history.length === 0) return res.status(404).send({ message: 'Purchase history not found' })
        return res.send({ message: 'History Shopping', history })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting shoppings' })
    }
}

export const searchHistoryShopping = async (req, res) => {
    try {
        let { id } = req.params
        const query = [{ path: 'user', select: '-password' }, { path: 'products.product', populate: { path: 'category' } }]
        let history = await Shopping.find({ user: id }).populate(query)
        if (history.length === 0) return res.status(404).send({ message: 'Purchase history not found' })
        return res.send({ message: 'History Shopping', history })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting shoppings' })
    }
}