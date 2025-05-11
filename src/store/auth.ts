import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
    // 登录状态
    const token = ref<string | null>(localStorage.getItem('token') || null);
    const isLoggedIn = ref(!!token.value);
    const username = ref<string | null>(localStorage.getItem('username')|| null);

    // 设置登录状态
    const login = (newToken: string,newUsername: string) => {
        token.value = newToken;
        username.value = newUsername;
        isLoggedIn.value = true;
        localStorage.setItem('token', newToken); // 持久化
        localStorage.setItem('username', newUsername);
    };

    // 退出登录
    const logout = () => {
        token.value = null;
        isLoggedIn.value = false;
        username.value = null;
        localStorage.removeItem('username');
        localStorage.removeItem('token'); // 清除持久化
        localStorage.removeItem('address'); // 可选：清除地址
    };

    return { token, username,isLoggedIn, login, logout };
});