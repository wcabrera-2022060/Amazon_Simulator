'use strict'

import { Schema, model } from 'mongoose'

const invoiceSchema = Schema({
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    nit: {
        type: String,
        default: 'Final Consumer',
        required: true
    },
    shopping: {
        type: Schema.ObjectId,
        ref: 'shopping',
        required: true
    }
}, {
    versionKey: false
})

export default model('invoice', invoiceSchema)