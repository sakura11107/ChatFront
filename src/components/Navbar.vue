<template>
  <div class="navbar-container">
    <el-row class="navbar">
      <el-col :span="18" class="left-section">
        <div class="logo">
          <img src="../assets/dalaoshi.png" alt="Logo" />
        </div>
      </el-col>
      <!-- 右侧按钮区域 -->
      <el-col :span="6" class="right-section">
        <div class="function">
          <el-button
              v-for="button in buttons"
              :key="button.text"
              :type="button.type"
              link
              @click="button.action"
          >
            {{ button.text }}
          </el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import router from "../router/router.ts";
import {useAuthStore} from "../store/auth.ts";
import {computed} from "vue";
import {ElMessage} from "element-plus";

const authStore = useAuthStore();

// 动态生成按钮
const buttons = computed(() => {
  if (authStore.isLoggedIn) {
    return [
      {
        type: 'primary',
        text: '退出',
        action: () => {
          authStore.logout();
          ElMessage.success('已退出登录');
          router.push('/');
        },
      },
    ];
  }
  return [
    { type: 'primary', text: '登陆', action: () => router.push('/login') },
    { type: 'primary', text: '注册', action: () => router.push('/register') },
  ];
});
</script>

<style scoped>
.navbar-container {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 60px;
  padding: 0 24px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.left-section {
  display: flex;
  align-items: center;
}

.logo img {
  height: 40px;
}

.right-section {
  display: flex;
  justify-content: flex-end;
}

.function {
  display: flex;
  gap: 16px;
}
</style>