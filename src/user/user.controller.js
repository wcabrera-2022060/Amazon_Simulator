'use strict'

import { checkPassword, encrypt } from '../../utils/encrypt.js'
import { generateJwt } from '../../utils/jwt.js'
import { checkDates } from '../../utils/validations.js'
import User from './user.model.js'

export const createUser = async (req, res) => {
    try {
        let data = req.body
        const required = ['name', 'surname', 'username', 'email', 'password']
        let missingData = required.filter(field => !data[field] || data[field].replaceAll(' ', '').length === 0)
        if (missingData.length > 0) return res.status(400).send({ message: `Missing required fields ${missingData.join(', ')}` })
        let verifyUsername = await User.findOne({ $or: [{ username: data.username }, { email: data.email }] })
        if (verifyUsername) return res.status(400).send({ message: 'Username or email not available' })
        data.password = await encrypt(data.password)
        data.role = 'CLIENT'
        let user = new User(data)
        await user.save()
        return res.send({ message: 'User created successfully', user })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error creating user' })
    }
}

export const defaultAdmin = async (req, res) => {
    try {
        let existUser = await User.find({})
        if (existUser.length === 0) {
            const pass = await encrypt(process.env.PASS_ADMIN)
            let admin = new User({
                name: 'Josue',
                surname: 'Noj',
                username: 'jnoj',
                email: 'jnoj@kinal.edu.gt',
                password: pass,
                role: 'ADMIN'
            })
            await admin.save()
            console.log('First admin created')
        }
    } catch (error) {
        console.error(error)
        console.log('Error creating default admin')
    }
}

export const login = async (req, res) => {
    try {
        let { username, password, email } = req.body
        if (password === '' || password === undefined) return res.status(400).send({ message: 'Password required' })
        if ((username === '' || username === undefined) && (email === '' || email === undefined)) return res.status(400).send({ message: 'Username o email required' })
        let user = await User.findOne({ $or: [{ username: username }, { email: email }] })
        if (user && await checkPassword(password, user.password)) {
            let userInfo = {
                uid: user._id,
                name: user.name,
                surname: user.surname,
                username: user.username,
                email: user.email,
                role: user.role
            }
            let token = await generateJwt(userInfo)
            return res.send({
                message: `Welcome ${user.name}`,
                userInfo,
                token
            })
        }
        return res.status(404).send({ message: 'Invalid credentials' })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Failed login' })
    }
}

export const getUsers = async (req, res) => {
    try {
        let users = await User.find({})
        if (users.length === 0) return res.status(404).send({ message: 'Users not found' })
        return res.send({ message: 'Users found', users })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error showing users' })
    }
}

export const searchUser = async (req, res) => {
    try {
        let { id } = req.params
        let user = await User.findOne({ _id: id })
        if (!user) return res.status(404).send({ message: 'User not found' })
        return res.send({ message: 'User found', user })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error searching user' })
    }
}

export const updateUser = async (req, res) => {
    try {
        let { _id } = req.user
        let { id } = req.params
        let data = req.body
        let user = checkDates(data, id)
        if (!user) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        if (_id.toString() !== id.toString()) return res.status(401).send({ message: 'You cannot edit his profile' })
        let verifyUsername = await User.findOne({ $or: [{ username: data.username }, { email: data.email }] })
        if (verifyUsername) return res.status(400).send({ message: 'Username or email not available' })
        let updatedUser = await User.findOneAndUpdate({ _id: id }, data, { new: true, projection: { password: 0 } })
        if (!updatedUser) return res.status(404).send({ message: 'User not found, not updated' })
        return res.send({ message: 'User updated successfully', updatedUser })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating user' })
    }
}

export const deleteUser = async (req, res) => {
    try {
        let { _id } = req.user
        let { id } = req.params
        let data = req.body
        if (_id.toString() !== id.toString()) return res.status(401).send({ message: 'You cannot delete this user' })
        let { password } = await User.findOne({ _id: id })
        if (!await checkPassword(data.password, password)) return res.status(401).send({ message: 'You need to add your password correctly' })
        let user = await User.findOneAndDelete({ _id: id })
        if (!user) return res.status(404).send({ message: 'User not found, not deleted' })
        return res.send({ message: 'Deleted user succesfully', user })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting user' })
    }
}

export const userToAdmin = async (req, res) => {
    try {
        let { id } = req.params
        let user = await User.findOneAndUpdate({ _id: id }, { role: 'ADMIN' }, { new: true })
        if (!user) return res.status(404).send({ message: 'User not found, role not updated' })
        return res.send({ message: 'This user is now an administrator', user })
    } catch (error) {
        console.error(error)
        return res.status(500).send
    }
}

export const updateUsers = async (req, res) => {
    try {
        let { id } = req.params
        let data = req.body
        let userData = checkDates(data, id)
        if (!userData) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        let user = await User.findOne({ _id: id })
        if (user.role === 'ADMIN') return res.status(401).send({ message: 'Cannot update to another admin' })
        let update = await User.findOneAndUpdate({ _id: id }, data, { new: true })
        if (!update) return res.status(404).send({ message: 'User not found not updated' })
        return res.send({ message: 'User updated successfully', update })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error updating user' })
    }
}

export const deleteUsers = async (req, res) => {
    try {
        let { id } = req.params
        let user = await User.findOne({ _id: id })
        if (user.role === 'ADMIN') return res.status(401).send({ message: 'Cannot delete to another admin' })
        let deleteUser = await User.findOneAndDelete({ _id: id })
        if (!deleteUser) return res.status(404).send({ message: 'User not found not deleted' })
        return res.send({ message: 'User deleted successfully', deleteUser })
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error deleting user' })
    }
}

export const updatePassword = async (req, res) => {
    try {
        let { _id } = req.user
        let { id } = req.params
        let { oldPassword, newPassword } = req.body
        let user = await User.findOne({ _id: id })
        if (!user) return res.status(404).send({ message: 'User not found' })
        if (user._id.toString() !== _id.toString()) return res.status(401).send({ message: 'You do not have permission to update this users password' })
        if (await checkPassword(oldPassword, user.password)) {
            let updated = await User.findOneAndUpdate({ _id: _id }, { password: await encrypt(newPassword) }, { new: true })
            if (!updated) return res.status(500).send({ message: 'User not found, not updated password' })
            return res.send({ message: 'Updated password successfully' })
        }
        return res.status(404).send({ message: 'Need to enter your old password to update' })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: 'Error updating password' })
    }
}