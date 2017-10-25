import Vue from 'vue'
import Vuex from 'vuex'
import console from './modules/console/module.js'
//import chain from './modules/chain/module.js'
//import node from './modules/node/module.js'

Vue.use(Vuex)

// 应用初始状态
const state = {

};

// 定义所需的 mutations
const mutations = {

};

// 创建 store 实例
export default new Vuex.Store({
	modules: {
	console
//  node: node,
//  chain: chain
	},
	state
})

