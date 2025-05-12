<template>
  <el-dialog
      v-model="internalVisible"
      :title="dialogTitle"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="handleDialogClose"
  >
    <el-select
        v-model="tempValue"
        placeholder="请点击选择"
        style="width: 100%"
        clearable
        @change="handleSelectChange"
    >
      <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
      ></el-option>
    </el-select>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">{{ cancelButtonText }}</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="!tempValue">
          {{ confirmButtonText }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, type PropType } from 'vue';

interface Option {
  value: any;
  label: string;
  [key: string]: any;
}

const props = defineProps({
  modelValue: {
    type: [String, Number, Array] as PropType<string | number | Array<any>>,
    default: null,
  },
  options: {
    type: Array as PropType<Option[]>,
    default: () => [],
  },
  visible: {
    type: Boolean,
    default: false,
  },
  dialogTitle: {
    type: String,
    default: '请选择地区',
  },
  confirmButtonText: {
    type: String,
    default: '确认',
  },
  cancelButtonText: {
    type: String,
    default: '取消',
  },
});

const emit = defineEmits([
  'update:modelValue',
  'update:visible',
  'change',
  'cancel',
]);

// 内部状态
const internalVisible = ref(props.visible);
const tempValue = ref(props.modelValue); // 临时选择值
const previousValue = ref(props.modelValue); // 上一次确认的值

// 同步 visible prop
watch(
    () => props.visible,
    (newVisible) => {
      internalVisible.value = newVisible;
      if (newVisible) {
        tempValue.value = props.modelValue; // 打开对话框时同步当前值
      }
    }
);

// 同步 modelValue prop
watch(
    () => props.modelValue,
    (newValue) => {
      tempValue.value = newValue;
      previousValue.value = newValue;
    }
);

// 对话框关闭时更新 visible
watch(internalVisible, (newVisible) => {
  emit('update:visible', newVisible);
});

// 选择变化
const handleSelectChange = (value: any) => {
  tempValue.value = value;
};

// 确认
const handleConfirm = () => {
  if (!tempValue.value) {
    return;
  }
  previousValue.value = tempValue.value;
  emit('update:modelValue', tempValue.value);
  emit('change', tempValue.value);
  internalVisible.value = false;
};

// 取消
const handleCancel = () => {
  tempValue.value = previousValue.value; // 恢复上一次确认的值
  emit('cancel');
  internalVisible.value = false;
};

// 对话框关闭
const handleDialogClose = () => {
  tempValue.value = previousValue.value; // 确保关闭时恢复值
  emit('cancel');
  internalVisible.value = false;
};
</script>

<style scoped>
.el-select {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>