<template>
  <div class="container">
    <my-dialog-select
        v-model="selectedProvince"
        :options="provinceOptions"
        :visible="dialogVisible"
        @update:visible="dialogVisible = $event"
        @change="handleProvinceChange"
        dialog-title="选择您的地区"
    ></my-dialog-select>
    <div class="map-section">
      <div class="region-info">
        <el-text type="primary">
          您当前所选择的地区为：<el-text type="success">{{ selectedProvince || '未选择' }}</el-text>
        </el-text>
      </div>
      <div id="map"></div>
    </div>
    <div class="chat-section">
      <h3>{{ selectedProvince || '未选择地区' }} 聊天室</h3>
      <div class="message-list">
        <div
            v-for="(message, index) in messages"
            :key="index"
            class="message"
            :class="{ 'message-self': message.sender === username }"
        >
          <div class="message-sender">{{ message.sender }}</div>
          <div class="message-content">{{ message.content }}</div>
        </div>
      </div>
      <div class="input-area">
        <el-input
            v-model="messageContent"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
            clearable
            class="custom-input"
        ></el-input>
        <el-button type="primary" @click="sendMessage" class="custom-button">发送</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ElMessage } from 'element-plus';
import MyDialogSelect from "../components/MyDialogSelect.vue";
import {useAuthStore} from "../store/auth.ts";

interface Option {
  value: any;
  label: string;
  [key: string]: any;
}

const authStore = useAuthStore();
const username = computed(() => authStore.username || '匿名用户');

const dialogVisible = ref(false);
const selectedProvince = ref<string | undefined>(localStorage.getItem('address') || undefined);
const provinceOptions = ref<Option[]>([]);

const messageContent = ref('');
const messages = ref<{ sender: string; content: string; region: string }[]>([]);
let stompClient: Client | null = null;

const handleProvinceChange = (value: string) => {
  localStorage.setItem('address', value);
  messages.value = [];
  highlightProvince(value);
  connectWebSocket();
};


const highlightProvince = (province: string) => {
  if (mapChart) {
    mapChart.setOption({
      geo: {
        regions: [
          {
            name: province,
            itemStyle: {
              areaColor: '#ff4d4f',
            },
          },
        ],
      },
    });
  }
};


const connectWebSocket = () => {
  if (!authStore.isLoggedIn) {
    console.log('用户未登录，跳过 WebSocket 连接');
    return;
  }
  if (!selectedProvince.value) {
    dialogVisible.value = true;
    console.log('未选择地区');
    return;
  }

  if (stompClient) {
    stompClient.deactivate();
  }

  const socket = new SockJS('http://localhost:8080/ws');
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('WebSocket 已连接');
      stompClient?.subscribe(`/topic/messages/${selectedProvince.value}`, (message) => {
        const msg = JSON.parse(message.body);
        messages.value.push(msg);
      });
    },
    onStompError: (frame) => {
      console.error('STOMP 错误:', frame);
      ElMessage.error('聊天室连接失败，请稍后重试');
    },
  });
  stompClient.activate();
};


const sendMessage = () => {
  if (!messageContent.value.trim()) {
    ElMessage.warning('消息不能为空');
    return;
  }
  if (!stompClient?.connected) {
    ElMessage.error('未连接到聊天室');
    return;
  }
  if (!selectedProvince.value) {
    ElMessage.error('请先选择地区');
    dialogVisible.value = true;
    return;
  }

  const message = {
    sender: username.value,
    content: messageContent.value,
    region: selectedProvince.value,
  };
  stompClient.publish({
    destination: '/app/chat',
    body: JSON.stringify(message),
  });
  messageContent.value = '';
};


let mapChart: echarts.ECharts | null = null;


const getChinaMapData = async () => {
  try {
    const response = await axios.get('https://geojson.cn/api/china/1.6.2/china.json');
    const mapData = response.data;
    echarts.registerMap('China', mapData);

    provinceOptions.value = mapData.features
        .map((feature: any) => ({
          value: feature.properties.name,
          label: feature.properties.name,
        }))
        .filter((option: Option) => option.label);

    initMap();
  } catch (error) {
    console.error('获取地图数据失败', error);
  }
};


const initMap = () => {
  nextTick(() => {
    mapChart = echarts.init(document.getElementById('map')!);
    const option = {
      geo: {
        map: 'China',
        roam: true,
        zoom: 1.2,
        label: {
          show: true,
          color: '#1defb0',
          fontSize: 10,
        },
        itemStyle: {
          areaColor: '#323c48',
          borderColor: '#404a59',
        },
        emphasis: {
          itemStyle: {
            areaColor: '#ffde93',
            borderColor: '#fff',
            borderWidth: 1,
          },
          label: {
            show: true,
            color: '#ff4d4f',
            fontSize: 12,
          },
        },
      },
    };
    mapChart.setOption(option);

    if (selectedProvince.value) {
      highlightProvince(selectedProvince.value);
    }
  });
};


const handleResize = () => {
  if (mapChart) {
    mapChart.resize();
  }
};


watch(
    () => authStore.isLoggedIn,
    (isLoggedIn) => {
      if (isLoggedIn && selectedProvince.value) {
        console.log('用户已登录，连接 WebSocket');
        nextTick(() => connectWebSocket()); // 确保 DOM 更新后连接
      } else {
        console.log('用户已登出或未选择地区，断开 WebSocket');
        if (stompClient) {
          stompClient.deactivate();
          stompClient = null;
        }
        messages.value = []; // 清空消息列表
      }
    },
    { immediate: true } // 立即触发以检查初始状态
);

onMounted(() => {
  getChinaMapData();
  dialogVisible.value = localStorage.getItem('address') === null;
  connectWebSocket();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (stompClient) {
    stompClient.deactivate();
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  width: 1200px;
  height: 800px;
  overflow: hidden;
}

.map-section {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  #map {
    flex: 1;
  }
}

.chat-section {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  padding: 10px;
  box-sizing: border-box;
  gap: 10px;
  .chat-section h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #303133;
    font-weight: 500;
  }

  /* 消息列表 */
  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #e8e8e8;
  }

  .message {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
    align-items: flex-start;
  }

  .message-self {
    align-items: flex-end;
  }

  .message-sender {
    font-size: 12px;
    color: #909399;
    margin-bottom: 4px;
  }

  .message-content {
    max-width: 70%;
    padding: 8px 12px;
    border-radius: 12px;
    background: #e6f7ff;
    color: #303133;
    word-break: break-word;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .message-self .message-content {
    background: #409eff;
    color: #fff;
    border-radius: 12px 12px 0 12px;
  }

  .input-area {
    display: flex;
    gap: 10px;
    background: #f8f9fc;
    padding: 10px;
    border-radius: 8px;
  }


  .input-area .custom-button {
    border-radius: 8px;
    padding: 8px 20px;
    background: linear-gradient(90deg, #409eff, #79bbff);
    border: none;
    transition: all 0.3s ease;
  }

  .input-area .custom-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>