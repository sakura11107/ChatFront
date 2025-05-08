<template>
  <el-select
      v-model="currentValue"
      v-bind="Object.assign({}, $attrs)"
      @change="handleChange"
      @visible-change="handleVisibleChange"
      @remove-tag="handleRemoveTag"
      @clear="handleClear"
      @blur="handleBlur"
      @focus="handleFocus"
  >
    <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        v-bind="Object.assign({}, $attrs.option)"
    >
      <slot name="option" :option="item">
        {{ item.label }}
      </slot>
    </el-option>
    <template v-slot:prefix>
      <slot name="prefix"></slot>
    </template>
    <template v-slot:empty>
      <slot name="empty">无数据</slot>
    </template>
  </el-select>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, type PropType } from "vue";

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
});

const emit = defineEmits([
  "update:modelValue",
  "change",
  "visible-change",
  "remove-tag",
  "clear",
  "blur",
  "focus",
]);

const currentValue = ref(props.modelValue);

watch(
    () => props.modelValue,
    (newValue) => {
      currentValue.value = newValue;
    }
);

watch(currentValue, (newValue) => {
  emit("update:modelValue", newValue);
});

const handleChange = (value: any) => {
  emit("change", value);
};

const handleVisibleChange = (visible: boolean) => {
  emit("visible-change", visible);
};

const handleRemoveTag = (value: any) => {
  emit("remove-tag", value);
};

const handleClear = () => {
  emit("clear");
};

const handleBlur = () => {
  emit("blur");
};

const handleFocus = () => {
  emit("focus");
};
</script>

<style scoped>
/* 在这里添加你的样式 */
</style>