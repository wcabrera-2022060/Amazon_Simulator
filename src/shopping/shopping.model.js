'use strict'

import { Schema, model } from 'mongoose'

const shoppingSchema = Schema({
    products: [{
        product: {
            type: Schema.ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    subTotal: {
        type: Number,
        required: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    versionKey: false
})

export default model('shopping', shoppingSchema)