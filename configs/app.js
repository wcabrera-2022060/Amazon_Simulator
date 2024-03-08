'use strict'

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from 'dotenv'
import userRoutes from '../src/user/user.routes.js'
import categoryRoutes from '../src/category/category.routes.js'
import productRoutes from '../src/product/product.routes.js'
import shoppingRoutes from '../src/shopping/shopping.routes.js'
import invoiceRoutes from '../src/invoice/invoice.routes.js'

const app = express()
config()
const port = process.env.PORT

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan('dev'))

app.use(userRoutes)
app.use(categoryRoutes)
app.use(productRoutes)
app.use(shoppingRoutes)
app.use(invoiceRoutes)

export const initServer = () => {
    app.listen(port)
    console.log(`Server HTTP running in port ${port}`)
}