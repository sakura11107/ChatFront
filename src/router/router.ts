import {createRouter,createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import NotFound from "../views/NotFound.vue";
import Chat from "../components/Chat.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Test from "../views/Test.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: Home,
            name: '首页'
        },
        {
            path:'/login',
            component: Login,
            name: '登录'
        },
        {
            path:'/register',
            component: Register,
            name: '注册'
        },
        {
            path:'/chat',
            component: Chat,
            name: '聊天室'
        },
        {
            path:'/test',
            component:Test,
            name: '测试'
        },
        {
            path: '/:pathMatch(.*)*',
            component: NotFound
        }
    ]
})

export default router;