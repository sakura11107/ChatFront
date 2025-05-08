<template>
  <el-container style="min-height: 100vh;">
    <el-header style="height: 60px;">
      <Navbar></Navbar>
    </el-header>
    <el-main style="flex: 1; padding-top: 60px; overflow: hidden;">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import Navbar from "./components/Navbar.vue";
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}
</style>