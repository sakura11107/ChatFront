<template>
  <div class="login-container">
    <el-card class="login-card">
      <el-form
          ref="loginForm"
          :model="formData"
          :rules="rules"
          label-width="120px"
          class="login-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
              clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="formData.password"
              placeholder="请输入密码"
              type="password"
              show-password
              clearable
          ></el-input>
        </el-form-item>

        <el-button type="primary" @click="goToRegister">暂无账号？去注册</el-button>
        <el-button type="primary" @click="gotoHome">返回首页</el-button>
        <el-button type="primary" @click="submitForm">登陆</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">

import { reactive, ref } from 'vue';
import {ElMessage, ElNotification, type FormInstance, type FormRules} from "element-plus";
import router from "../router/router.ts";
import {login} from "../api/auth.ts";
import {useAuthStore} from "../store/auth.ts";

interface FormData {
  username: string;
  password: string;
}

const formData = reactive<FormData>({
  username: '',
  password: '',
});

const loginForm = ref<FormInstance|null>(null);
const authStore = useAuthStore;

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' },
  ],
};

const submitForm = async () => {
  loginForm.value?.validate(async (valid) => {
    if (valid) {
      try{

        const requestData = {
          username: formData.username,
          password: formData.password,
        };

        const response = await login(requestData);

        if (response.code === 200) {
          authStore.login(response.token);
          ElNotification({
            title: '登录成功',
            message: '欢迎回来！即将跳转到地图聊天室',
            type: 'success',
          });
          // 延迟跳转到首页
          setTimeout(() => {
            router.push('/chatMap');
          }, 2000);
        } else {
          ElMessage.error(response.message || '登录失败');
        }
      }catch (error){
        ElMessage.error('登录失败,请稍后重试');
      }
    } else {
      console.log('error submit!');
    }
  });
};

const goToRegister = () => {
  router.push('/register');
}

const gotoHome = () => {
  router.push('/');
}

</script>

<style scoped>
.login-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 100%;
  max-width: 500px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .login-card {
    margin: 20px;
  }
}
</style>