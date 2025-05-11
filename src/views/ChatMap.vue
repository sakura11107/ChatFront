<template>
  <div class="map-container">
    <el-dialog v-model="dialogVisible" title="请选择地区">
      <my-select
          v-model="selectedProvince"
          :options="provinceOptions"
          placeholder="请点击选择"
          @change="handleProvinceChange"
      ></my-select>
    </el-dialog>
    <div class="map-section">
      <div id="map" :style="{ width: mapWidth, height: mapHeight }"></div>
      <div class="region-info">
        <el-text type="primary">
          您当前所选择的地区为：<el-text type="success">{{ selectedProvince || '未选择' }}</el-text>
        </el-text>
      </div>
    </div>
    <div class="chat-section">
      <h3>{{ selectedProvince || '未选择地区' }} 聊天室</h3>
      <div class="message-list">
        <div v-for="(message, index) in messages" :key="index" class="message">
          <strong>{{ message.sender }}:</strong> {{ message.content }}
        </div>
      </div>
      <div class="input-area">
        <el-input
            v-model="messageContent"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
            clearable
        ></el-input>
        <el-button type="primary" @click="sendMessage">发送</el-button>
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
import MySelect from '../components/MySelect.vue';
import {useAuthStore} from "../store/auth.ts";

// 定义下拉选项接口
interface Option {
  value: any;
  label: string;
  [key: string]: any;
}

// Pinia 状态管理
const authStore = useAuthStore();
const username = computed(() => authStore.username || '匿名用户');

// 地图和地区选择
const mapWidth = ref('100%');
const mapHeight = ref('calc(100% - 40px)');
const dialogVisible = ref(false);
const selectedProvince = ref<string | undefined>(localStorage.getItem('address') || undefined);
const provinceOptions = ref<Option[]>([]);

// 聊天室状态
const messageContent = ref('');
const messages = ref<{ sender: string; content: string; region: string }[]>([]);
let stompClient: Client | null = null;

// 处理省市选择
const handleProvinceChange = (value: string) => {
  localStorage.setItem('address', value);
  dialogVisible.value = false;
  messages.value = []; // 清空消息列表
  highlightProvince(value);
  connectWebSocket();
};

// 高亮省市
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

// WebSocket 连接
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

  // 断开现有连接
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

// 发送消息
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

// 地图实例
let mapChart: echarts.ECharts | null = null;

// 获取地图数据
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

// 初始化地图
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

// 监听窗口大小变化
const handleResize = () => {
  if (mapChart) {
    mapChart.resize();
    mapHeight.value = 'calc(100% - 40px)';
  }
};

// 监听登录状态变化
watch(
    () => authStore.isLoggedIn,
    (isLoggedIn) => {
      if (isLoggedIn && selectedProvince.value) {
        console.log('用户已登录，连接 WebSocket');
        connectWebSocket();
      } else {
        console.log('用户已登出，断开 WebSocket');
        if (stompClient) {
          stompClient.deactivate();
          stompClient = null;
        }
        messages.value = []; // 清空消息列表
      }
    }
);

onMounted(() => {
  mapHeight.value = 'calc(100% - 40px)';
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
.map-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100vh - 60px); /* 减去导航栏高度 */
  margin: 0;
  padding: 20px;
  box-sizing: border-box;
  gap: 20px;
}

.map-section {
  display: flex;
  flex-direction: column;
  width: 60%;
  height: 100%;
  gap: 10px;
}

#map {
  flex: 1;
  width: 100%;
  border: 1px solid #e8e8e8;
}

.region-info {
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 10px;
}

.chat-section {
  display: flex;
  flex-direction: column;
  width: 40%;
  height: 100%;
  border: 1px solid #e8e8e8;
  padding: 10px;
  box-sizing: border-box;
  gap: 10px;
}

.chat-section h3 {
  margin: 0 0 10px 0;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #e8e8e8;
}

.message {
  margin-bottom: 10px;
}

.input-area {
  display: flex;
  gap: 10px;
}

.input-area .el-input {
  flex: 1;
}
</style>