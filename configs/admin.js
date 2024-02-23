'use strict'

import User from '../src/user/user.model.js'
import {encrypt} from '../utils/encrypt.js'

export const defaultAdmin = async(req, res) => {
    try {
        let existUser = await User.find({})
        if(existUser.length === 0) {
            const pass = await encrypt(process.env.PASS_ADMIN)
            let admin = new User({
                name: 'Josue',
                surname: 'Noj',
                username: 'jnoj',
                password: pass,
                role: 'ADMIN'
            })
            await admin.save()
            console.log('First admin created')
        }
    } catch (error) {
        console.error(error)
        console.log('Error crating default admin')
    }
}