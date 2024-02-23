'use strict'

import { Schema, model } from 'mongoose'

const categorySchema = Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        unique: true,
        required: true
    }
}, {
    versionKey: false
})

export default model('category', categorySchema)