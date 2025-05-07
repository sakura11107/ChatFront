<template>
  <el-card class="main-card">
    <!-- 顶部搜索框 -->
    <div class="top-search-area">
      <!-- 搜索框 -->
      <div class="custom-search-wrapper">
        <input
            v-model="searchQuery"
            type="text"
            placeholder="请输入搜索内容"
            class="custom-input"
        />
        <button class="custom-button" @click="handleSearch">搜索</button>
      </div>

      <!-- 圆角内容块 -->
      <div class="info-boxes">
        <div class="info-box">文字1</div>
        <div class="info-box">文字2</div>
        <div class="info-box">文字3</div>
      </div>
    </div>


    <!-- 三栏布局 -->
    <div class="three-column">
      <!-- 左侧：筛选条件 -->
      <el-card class="column filter">
        <div class="section-title">筛选条件</div>
        <el-divider></el-divider>
        <div class="sub-title">文件类型</div>
        <el-checkbox-group v-model="selectedFileTypes" class="checkbox-group">
          <el-checkbox label="数据表数据" />
          <el-checkbox label="图片数据" />
          <el-checkbox label="图谱数据" />
          <el-checkbox label="视音频资料" />
          <el-checkbox label="表格数据" />
          <el-checkbox label="流式数据" />
          <el-checkbox label="文档数据" />
          <el-select style="width: 50%"></el-select>
        </el-checkbox-group>

        <div class="sub-title">数据来源</div>
        <el-tree
            :data="data"
            :props="defaultProps"
            v-model:checked="selectedDataTypes"
            show-checkbox
            node-key="label"
            default-expand-all
        ></el-tree>

        <div class="sub-title">文件时间</div>
        <el-radio-group v-model="selectedDate" class="radio-group">
          <el-radio label="近一天" />
          <el-radio label="近一周" />
          <el-radio label="近一月" />
          <el-radio label="近一年" />
        </el-radio-group>
        <div class="radio-group">
          <el-radio label="全部" />
        </div>
      </el-card>

      <!-- 中间：搜索结果 -->
      <el-card class="column results">
        <div class="section-title">搜索结果</div>
        <el-divider></el-divider>
        <div class="result-content">
          暂无搜索结果
        </div>
      </el-card>

      <!-- 右侧：热门推荐 -->
      <el-card class="column hot">
        <div class="section-title">热门推荐</div>
        <el-divider></el-divider>
        <ul class="hot-list">
          <li
              v-for="(item, index) in hotList"
              :key="index"
              :class="['hot-item', `rank-${index + 1}`]"
          >
            {{ index + 1 }}. {{ item }}
          </li>
        </ul>
      </el-card>

    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const searchQuery = ref('');
const selectedFileTypes = ref([]);
const selectedDataTypes = ref([]);
const selectedDate = ref('全部');

const hotList = ref([
  '台海',
  '坦克发射阵地',
  '豹2坦克',
  '99式坦克',
  'test',
  '坦克',
  '军队',
  '步兵战车',
  '我军队拟在台海领域执行战备执勤任务',
  '边防会晤',
]);

function handleSearch() {
  console.log('搜索内容：', searchQuery.value)
}

const data = [
  {
    label: '原始库'
  },
  {
    label: '前置库',
    children: [
      { label: '前置库-军语库' },
      { label: '前置库-通用分析数据源' },
      { label: '前置库-智能问答数据源' },
      { label: '前置库-武器装备图像' }
    ]
  },
  { label: '集成库' },
  { label: '应用库' }
];

const defaultProps = {
  children: 'children',
  label: 'label'
};

</script>

<style scoped>
.main-card {
  padding: 5px;
  width: auto;
}


/* 顶部蓝色区域包裹搜索和内容块 */
.top-search-area {
  background-color: #409EFF;
  padding: 30px 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

/* 搜索框居中 */
.custom-search-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.custom-search-wrapper > * {
  height: 40px;
  font-size: 14px;
}

.custom-input {
  width: 300px;
  padding: 0 16px;
  border: 1px solid #dcdfe6;
  border-right: none;
  border-radius: 20px 0 0 20px;
  outline: none;
}

.custom-button {
  padding: 0 20px;
  background-color: #67C23A;
  color: white;
  border: 1px solid #67C23A;
  border-radius: 0 20px 20px 0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.custom-button:hover {
  background-color: #85ce61;
}

/* 圆角内容块横排 */
.info-boxes {
  display: flex;
  justify-content: center;
  gap:10px;
}

.info-box {
  background-color: white;
  color: #333;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.three-column {
  display: grid;
  grid-template-columns: 1.3fr 2.5fr 1.2fr;
  gap: 10px;
}


.section-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 16px;
  text-align: left;
}

.sub-title {
  font-weight: bold;
  margin: 10px 0 6px;
  text-align: left;
}

.checkbox-group,
.radio-group {
  display: flex;
  flex-wrap: wrap;
}

.hot-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hot-item {
  text-align: left;
  padding: 4px 0;
}

/* 特殊颜色处理：前三项 */
.rank-1 {
  color: red;
}
.rank-2 {
  color: orange;
}
.rank-3 {
  color: #409EFF; /* Element Plus 默认蓝 */
}

</style>