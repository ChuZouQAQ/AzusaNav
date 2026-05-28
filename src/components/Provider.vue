<template>
  <!-- 全局配置组件 -->
  <n-config-provider
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme="darkTheme"
    :theme-overrides="themeOverrides"
    abstract
    inline-theme-disabled
  >
    <n-dialog-provider>
      <n-notification-provider>
        <n-message-provider :max="1">
          <slot />
          <NaiveProviderContent />
        </n-message-provider>
      </n-notification-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup>
import { defineComponent, h } from "vue";
import {
  zhCN,
  dateZhCN,
  darkTheme,
  NConfigProvider,
  NDialogProvider,
  NNotificationProvider,
  NMessageProvider,
  useDialog,
  useNotification,
  useMessage,
} from "naive-ui";

// 全局主题
const themeOverrides = {
  common: {
    fontFamily: "'HarmonyOS_Regular', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    primaryColor: "#ffb7c5",
    primaryColorHover: "#ff8fad",
    primaryColorSuppl: "#ffd5e4",
    primaryColorPressed: "#f06292",
  },
};

// 挂载 Naive 组件
const setupNaiveTools = () => {
  // 通知
  window.$notification = useNotification();
  // 信息
  window.$message = useMessage();
  // 对话框
  window.$dialog = useDialog();
};

// Naive 功能组件
const NaiveProviderContent = defineComponent({
  setup() {
    setupNaiveTools();
  },
  render() {
    return h("div", { className: "main-tools" });
  },
});
</script>
