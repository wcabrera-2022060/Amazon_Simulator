'use strict'

import { defaultAdmin } from './configs/admin.js'
import { initServer } from './configs/app.js'
import { connect } from './configs/db.js'
import { defaultCategory } from './src/category/category.controller.js'

initServer()
connect()
defaultAdmin()
defaultCategory()