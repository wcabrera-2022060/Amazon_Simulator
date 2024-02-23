'use strict'

import { Schema, model } from 'mongoose'

const productSchema = Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        unique: true,
        required: true
    },
    price: {
        type: Number,
        min: 1.00,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    average: {
        type: String,
        enum: ['HIGH', 'MEDIUM', 'LOW', 'NONE'],
        default: 'NONE',
        required: true
    },
    category: {
        type: Schema.ObjectId,
        ref: 'category',
        required: true
    }
}, {
    versionKey: false
})

export default model('product', productSchema)