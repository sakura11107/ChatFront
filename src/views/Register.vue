<template>
  <el-card class="register-card">
    <el-form
        ref="registerForm"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="register-form"
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
      <el-form-item label="确认密码" prop="password2">
        <el-input
            v-model="formData.password2"
            placeholder="请再次输入密码"
            type="password"
            show-password
            clearable
        ></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            clearable
        ></el-input>
      </el-form-item>
      <el-button type="primary" @click="gotoHome">返回首页</el-button>
      <el-button type="primary" @click="goToLogin">已有账号？去登陆</el-button>
      <el-button type="primary" @click="submitForm">注册</el-button>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ElMessage, ElNotification } from 'element-plus';
import { reactive, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import router from "../router/router.ts";
import {register} from "../api/auth.ts";

// 表单数据
interface FormData {
  username: string;
  password: string;
  password2: string;
  email: string;
}

const formData = reactive<FormData>({
  username: '',
  password: '',
  password2: '',
  email: '',
});

// 表单引用
const registerForm = ref<FormInstance | null>(null);

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' },
  ],
  password2: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
};

// 提交表单
const submitForm = async () => {
  registerForm.value?.validate(async (valid) => {
    if (valid) {
      try {
        // 构造请求数据，去掉 password2
        const requestData = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
        };

        // 发送注册请求
        const response = await register(requestData);
        //console.log('注册响应:', response);

        // 检查响应
        if (response.code === 200) {
          ElNotification({
            title: '注册成功',
            message: '欢迎加入我们！即将跳转到登录页面...',
            type: 'success',
          });
          // 延迟跳转到登录页面
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          ElMessage.error(response.message || '注册失败');
        }
      } catch (error) {
        ElMessage.error('注册失败，请稍后重试');
        console.error('注册错误:', error);
      }
    } else {
      ElMessage.error('表单填写有误，请检查');
    }
  });
};

// 返回首页
const gotoHome = () => {
  ElMessage.info('跳转到首页');
  // 示例：跳转到首页
  // window.location.href = '/';
};

// 跳转到登录页面
const goToLogin = () => {
  ElMessage.info('跳转到登录页面');
  // 示例：跳转到登录页面
  // window.location.href = '/login';
};
</script>

<style scoped>
.register-card {
  width: 400px;
  margin: 50px auto;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>