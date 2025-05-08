<template>
  <div class="map-container">
    <el-dialog v-model="dialogVisible" title="请选择地区">
      <my-select
          v-model="selectedProvince"
          :options="provinceOptions"
          placeholder="请点击选择"
          @change="handleProvinceChange"
      >
      </my-select>
    </el-dialog>
    <div id="map" :style="{ width: mapWidth, height: mapHeight }"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import * as echarts from "echarts";
import axios from "axios";
import MySelect from "../components/MySelect.vue";

interface Option {
  value: any;
  label: string;
  [key: string]: any;
}

// 地图容器的大小
const mapWidth = ref("1200px");
const mapHeight = ref("600px");

const dialogVisible = ref(false);

// 选中的省市
const selectedProvince = ref<string | undefined>(localStorage.getItem("address") || undefined);

const provinceOptions = ref<Option[]>([]);

// 处理省市选择
const handleProvinceChange = (value: string) => {
  localStorage.setItem("address", value); // 保存到 localStorage
  dialogVisible.value = false; // 关闭对话框
  // 可选：更新地图高亮显示选中的省市
  if (mapChart) {
    mapChart.setOption({
      geo: {
        regions: [
          {
            name: value,
            itemStyle: {
              areaColor: "#ff4d4f", // 高亮选中省市
            },
          },
        ],
      },
    });
  }
};

const highlightProvince = (province: string) => {
  if (mapChart) {
    mapChart.setOption({
      geo: {
        regions: [
          {
            name: province,
            itemStyle: {
              areaColor: "#ff4d4f",
            },
          },
        ],
      },
    });
  }
};

// 地图实例
let mapChart: echarts.ECharts | null = null;

// 获取地图数据
const getChinaMapData = async () => {
  try {
    const response = await axios.get("https://geojson.cn/api/china/1.6.2/china.json");
    const mapData = response.data;
    echarts.registerMap("China", mapData); // 注册地图

    // 从地图数据中提取省市名称
    provinceOptions.value = mapData.features
        .map((feature: any) => ({
          value: feature.properties.name,
          label: feature.properties.name,
        }))
        .filter((option: Option) => option.label);
    initMap();
  } catch (error) {
    console.error("获取地图数据失败", error);
  }
};

// 初始化地图
const initMap = () => {
  nextTick(() => {
    mapChart = echarts.init(document.getElementById("map")!);
    const option = {
      geo: {
        map: "China",
        roam: true, // 允许缩放和平移
        zoom: 1.2, // 缩放比例
        label: {
          show: true, // 显示地名
          color: "#1defb0",
          fontSize: 10,
        },
        itemStyle: {
          areaColor: "#323c48",
          borderColor: "#404a59",
        },
        emphasis: {
          itemStyle: {
            areaColor: "#ffde93", // 高亮时的区域颜色
            borderColor: "#fff", // 高亮时的边界颜色
            borderWidth: 1, // 高亮时的边界宽度
          },
          label: {
            show: true, // 高亮时显示地名
            color: "#ff4d4f", // 高亮时地名的颜色
            fontSize: 12, // 高亮时地名的字体大小
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
  }
};

onMounted(() => {
  getChinaMapData();
  dialogVisible.value = localStorage.getItem("address") === null;
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.map-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>