'use strict'

import { checkDates } from '../../utils/validations.js'
import Category from '../category/category.model.js'

export const createCategory = async (req, res) => {
    try {
        let data = req.body
        let category = new Category(data)
        await category.save()
        return res.send({ message: 'Category created successfully' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error creating category' })
    }
}

export const getCategories = async (req, res) => {
    try {
        let categories = await Category.find({})
        return res.send({ categories })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error getting categories' })
    }
}

export const searchCategory = async (req, res) => {
    try {
        let { name } = req.body
        let category = await Category.findOne({ name: name })
        if (!category) return res.send(404).send({ message: 'Category not found' })
        return res.send({message: 'Category found', category})
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching category' })
    }
}

export const updateCategory = async (req, res) => {
    try {
        let { searching } = req.body
        let data = req.body
        let category = checkDates(data, false)
        if (!category) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        let updateCategory = await Category.findOneAndUpdate({ name: searching }, data, { new: true })
        if (!updateCategory) return res.status(404).send({ message: 'Category nor found, not updated' })
        return res.send({ message: 'Category updated successfully', updateCategory })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating category' })
    }
}

export const deleteCategory = async (req, res) => {
    try {
        let { name } = req.body
        let category = await Category.findOneAndDelete({ name: name })
        if (!category) return res.status(404).send({ message: 'Category not found, not deleted' })
        return res.send({ message: 'Category deleted successfully', category })
    } catch (error) {
        console.error(error)
        return res.send(500).send({ message: 'Error deleting category' })
    }
}