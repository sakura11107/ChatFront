<template>
  <div style="max-width: 600px; margin: auto">
    <h2>Vue3 聊天室</h2>

    <input v-model="sender" placeholder="你的名字" />
    <input v-model="content" placeholder="消息内容" @keyup.enter="sendMessage" />
    <button @click="sendMessage">发送</button>

    <ul>
      <li v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg.sender }}:</strong> {{ msg.content }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const sender = ref("");
const content = ref("");
//const messages = ref([]);
const messages: any = ref([]);

let stompClient:any;
onMounted(() => {
  const socket = new SockJS("http://localhost:8080/ws");
  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: () => {}, // 可以填 console.log 查看调试日志
    reconnectDelay: 5000,
    onConnect: () => {
      stompClient.subscribe("/topic/messages", (message:any) => {
        const msg = JSON.parse(message.body);
        messages.value.push(msg);
      });
    },
  });

  stompClient.activate();
});

function sendMessage() {
  if (!sender.value || !content.value) return;

  stompClient.publish({
    destination: "/app/chat",
    body: JSON.stringify({
      sender: sender.value,
      content: content.value,
    }),
  });

  content.value = "";
}
</script>

<style scoped>
body {
  font-family: sans-serif;
}
input {
  margin: 5px;
}
</style>
