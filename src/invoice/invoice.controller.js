'use strict'

import fs from 'fs'
import PDFDocument from 'pdfkit-table'
import Invoice from './invoice.model.js'
import Shopping from '../shopping/shopping.model.js'
import Product from '../product/product.model.js'
import User from '../user/user.model.js'

export const createInvoice = async (req, res) => {
    try {
        let data = req.body
        const required = ['nit', 'shopping']
        let missingData = required.filter(field => !data[field] || data[field].replaceAll(' ', '').length === 0)
        if (missingData > 0) return res.status(400).send({ message: `Missing required fields ${missingData.join(', ')}` })
        let shopping = await Shopping.findOne({ _id: data.shopping })
        if (!shopping) return res.status(404).send({ message: 'Shopping cart not found' })
        let invoiceExist = await Invoice.findOne({ shopping: data.shopping })
        if (invoiceExist) return res.status(401).send({ message: 'An invoice has already been generated for this purchase' })
        let total = (shopping.subTotal * 0.12) + shopping.subTotal
        data.total = total
        let invoice = new Invoice(data)
        await invoice.save()
        await pdfInvoice(invoice)
        const query = [{ path: 'shopping', populate: [{ path: 'products.product', populate: { path: 'category' } }, { path: 'user', select: '-password' }] }]
        await invoice.populate(query)
        return res.send({ message: 'Invoice creating invoice', invoice })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error creating invoice' })
    }
}

export const updateInvoice = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let invoice = await Invoice.findOne({ _id: id })
        if (!invoice) return res.status(404).send({ message: 'Invoice not found' })
        let shopping = await Shopping.findOne({ _id: invoice.shopping })
        if (!shopping) return res.status(404).send({ message: 'Shopping not found' })
        if (data.nit && data.nit !== '') {
            await Invoice.findOneAndUpdate({ _id: id }, { nit: data.nit }, { new: true })
        }
        if (data.product && data.product !== '' && data.quantity && data.quantity !== '') {
            if (isNaN(data.quantity)) return res.status(400).send({ message: 'quantity must be a number' })

            let product = await Product.findOne({ _id: data.product })
            if (!product) return res.status(404).send({ message: 'Product not found' })

            let productExist = shopping.products.find(item => item.product.toString() === data.product)
            if (productExist) {
                if (parseInt(data.quantity) > productExist.quantity) return res.status(400).send({ message: 'Cannot remove more quantity than available in shopping' })
                productExist.quantity -= parseInt(data.quantity)
                if (productExist.quantity === 0) {
                    shopping.products = shopping.products.filter(item => item.product.toString() !== data.product)
                }
                shopping.subTotal -= parseFloat(product.price) * parseInt(data.quantity)
                invoice.total = (shopping.subTotal * 0.12) + shopping.subTotal
                let stock = product.stock + parseInt(data.quantity)
                await Product.findOneAndUpdate({ _id: data.product }, { stock: stock }, { new: true })
                await invoice.save()
                await shopping.save()
            } else return res.status(404).send({ message: 'The product to be canceled is not found in the shopping' })
        }
        const query = [{ path: 'shopping', populate: [{ path: 'products.product', populate: { path: 'category' } }, { path: 'user', select: '-password' }] }]
        let update = await Invoice.findOne({ _id: id }).populate(query)
        await pdfInvoice(update)
        return res.send({ message: 'Invoice updated successfully', update })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating invoice' })
    }
}

export const pdfInvoice = async (invoice) => {
    try {
        const { date, total, nit, shopping, _id } = invoice
        const formatDate = date.toLocaleString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        })
        let shoppingData = await Shopping.findOne({ _id: shopping })
        let userData = await User.findOne({ _id: shoppingData.user })
        const doc = new PDFDocument()
        doc.fontSize(25).font('Helvetica-Bold').text('Invoice', { align: 'center' }).moveDown(1)
        doc.fontSize(12).font('Helvetica-Bold').text('ID: ', { continued: true }).font('Helvetica').text(_id).moveDown(0.5)
        doc.fontSize(12).font('Helvetica-Bold').text('Date: ', { continued: true }).font('Helvetica').text(formatDate).moveDown(0.5)
        doc.fontSize(12).font('Helvetica-Bold').text('NIT: ', { continued: true }).font('Helvetica').text(nit).moveDown(3)
        const table = {
            headers: ['Product', 'Quantity', 'Price', 'Subtotal'],
            rows: []
        }
        for (const item of shoppingData.products) {
            let product = await Product.findOne({ _id: item.product })
            const subTotal = (item.quantity * product.price).toFixed(2)
            table.rows.push([product.name, item.quantity, `$${product.price.toFixed(2)}`, `$${subTotal}`])
        }
        doc.table(table, {
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(14),
            prepareRow: () => doc.font('Helvetica').fontSize(12)
        })
        doc.fontSize(13).font('Helvetica-Bold').text('Subtotal: ', { continued: true }).font('Helvetica').text(`$${shoppingData.subTotal.toFixed(2)}`).moveDown(0.5)
        doc.fontSize(13).font('Helvetica-Bold').text('Total: ', { continued: true }).font('Helvetica').text(`$${total.toFixed(2)}`).moveDown(3)
        doc.fontSize(13).font('Helvetica-Bold').text('Name: ', { continued: true }).font('Helvetica').text(userData.name).moveDown(0.5)
        doc.fontSize(13).font('Helvetica-Bold').text('Surname: ', { continued: true }).font('Helvetica').text(userData.surname).moveDown(0.5)
        doc.fontSize(13).font('Helvetica-Bold').text('Username: ', { continued: true }).font('Helvetica').text(userData.username).moveDown(0.5)
        doc.fontSize(13).font('Helvetica-Bold').text('Email: ', { continued: true }).font('Helvetica').text(userData.email).moveDown(3)
        doc.fontSize(14).text('Thanks for your purchase')
        const fileName = formatDate.replace(/[ ,:]/g, '-')
        doc.pipe(fs.createWriteStream(`${fileName}.pdf`))
        doc.end()
    } catch (error) {
        console.error(error)
    }
}