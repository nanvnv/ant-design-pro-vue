import storage from 'store'
import { login, getInfo, logout } from '@/api/user'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { welcome } from '@/utils/util'

const user = {
	state: {
		//token: getToken(),
		token: storage.get(ACCESS_TOKEN),
		name: '',
		avatar: '',
		introduction: '',
		roles: []
	},

	mutations: {
		SET_TOKEN: (state, token) => {
			state.token = token
		},
		SET_INTRODUCTION: (state, introduction) => {
			state.introduction = introduction
		},
		SET_NAME: (state, name) => {
			state.name = name
		},
		SET_AVATAR: (state, avatar) => {
			state.avatar = avatar
		},
		SET_ROLES: (state, roles) => {
			state.roles = roles
		}
	},

	actions: {
		login({ commit }, params) {
			const { username, password } = params;
			return new Promise((resolve, reject) => {
				login({ username: username.trim(), password: password.trim() }).then(response => {
					const { data } = response
					commit('SET_TOKEN', data.token)
					storage.set(ACCESS_TOKEN, data.token, 7 * 24 * 60 * 60 * 1000)
					resolve();
				}).catch(error => {
					reject(error)
				})
			})
		},
		getInfo({ commit, state }) {
			return new Promise((resolve, reject) => {
				getInfo(state.token).then(response => {
					const { data } = response
					if (!data) {
						reject('Verification failed, please Login again.')
					}
					const { roles, name, avatar, introduction } = data
					if (!roles || roles.length <= 0) {
						reject('getInfo: roles must be a non-null array!')
					}
					commit('SET_ROLES', roles)
					commit('SET_NAME', name)
					commit('SET_AVATAR', avatar)
					commit('SET_INTRODUCTION', introduction)
					resolve(data)
				}).catch(error => {
					reject(error)
				})
			})
		},
		// user logout
		logout({ commit, state }) {
			return new Promise((resolve, reject) => {
				logout(state.token).then(() => {
					commit('SET_TOKEN', '')
					commit('SET_ROLES', [])
					storage.remove(ACCESS_TOKEN)
					resolve()
				}).catch(error => {
					reject(error)
				})
			})
		},
		// remove token
		resetToken({ commit }) {
			return new Promise(resolve => {
				commit('SET_TOKEN', '')
				commit('SET_ROLES', [])
				storage.remove(ACCESS_TOKEN)
				resolve()
			})
		},
	}


}

export default user