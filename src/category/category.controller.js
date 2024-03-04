'use strict'

import Category from '../category/category.model.js'
import Product from '../product/product.model.js'

export const createCategory = async (req, res) => {
    try {
        let data = req.body
        const required = ['name', 'description']
        let missingData = required.filter(field => !data[field] || data[field].replaceAll(' ', '').length === 0)
        if (missingData.length > 0) return res.status(400).send({ message: `Missing required fields ${missingData.join(', ')}` })
        let dataCategory = await Category.findOne({ $or: [{ name: data.name }, { description: data.description }] })
        if (dataCategory) return res.status(409).send({ message: 'Name or description not available' })
        let category = new Category(data)
        await category.save()
        return res.send({ message: 'Category created successfully', category })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error creating category' })
    }
}

export const getCategories = async (req, res) => {
    try {
        let categories = await Category.find({})
        if (categories.length === 0) return res.status(404).send({ message: 'No categories to show' })
        return res.send({ message: 'Categories found', categories })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting categories' })
    }
}

export const searchCategory = async (req, res) => {
    try {
        let { id } = req.params
        let category = await Category.findOne({ _id: id })
        if (!category) return res.status(404).send({ message: 'Category not found' })
        return res.send({ message: 'Category found', category })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching category' })
    }
}

export const updateCategory = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let missingData = []
        for (const key in data) {
            if (data[key].replaceAll(' ', '').length === 0) missingData.push(key)
        }
        if (missingData.length > 0) return res.status(400).send({ message: `Missing data ${missingData.join(', ')}` })
        let dataCategory = await Category.findOne({ $or: [{ name: data.name }, { description: data.description }] })
        if (dataCategory) return res.status(409).send({ message: 'Name or description not available, in use' })
        let updateCategory = await Category.findOneAndUpdate({ _id: id }, data, { new: true })
        if (!updateCategory) return res.status(404).send({ message: 'Category nor found, not updated' })
        return res.send({ message: 'Category updated successfully', updateCategory })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating category' })
    }
}

export const deleteCategory = async (req, res) => {
    try {
        let { id } = req.params
        let { _id } = await Category.findOne({ name: 'Default' })
        if (_id.toString() === id.toString()) return res.status(403).send({ message: 'Impossible to delete the default category' })
        let category = await Category.findOneAndDelete({ _id: id })
        await Product.updateMany({ category: id }, { category: _id }, { new: true })
        if (!category) return res.status(404).send({ message: 'Category not found, not deleted' })
        return res.send({ message: 'Category deleted successfully', category })
    } catch (error) {
        console.error(error)
        return res.send(500).send({ message: 'Error deleting category' })
    }
}

export const defaultCategory = async (req, res) => {
    try {
        let existCategory = await Category.find({})
        if (existCategory.length === 0) {
            let category = new Category({
                name: 'Default',
                description: 'Category that is assigned to products that have a category that was deleted'
            })
            await category.save()
            console.log('Category default created')
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error creating default category' })
    }
}