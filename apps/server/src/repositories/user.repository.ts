import { UserModel } from '../models/User.model'

export async function createUser(input: Record<string, unknown>) {
  return UserModel.create(input)
}

export async function findUserByEmail(email: string) {
  return UserModel.findOne({ email }).lean()
}

export async function findUserByPhone(phone: string) {
  return UserModel.findOne({ phone }).lean()
}

export async function findUserById(id: string) {
  return UserModel.findById(id).lean()
}
