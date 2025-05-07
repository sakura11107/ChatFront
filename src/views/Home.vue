<template>
  <Navbar></Navbar>
  <el-button @click="gotoChat">进入聊天室</el-button>
  <el-button @click="gotoTest">测试</el-button>
</template>

<script setup lang="ts">
  import router from "../router/router.ts";
  import Navbar from "../components/Navbar.vue";

  const gotoChat = () =>{
    //进入Chat.vue
    router.push("/chat")
  }
  const gotoTest = () =>{
    //进入Chat.vue
    router.push("/test")
  }
</script>

<style scoped>

</style>