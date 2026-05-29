<template>
  <div :class="status.siteStatus !== 'normal' ? 'cover focus' : 'cover'">
    <!-- 樱花渐变兜底层 —— 即使图片未加载完成，也保留樱花氛围 -->
    <div class="sakura-gradient" />
    <img
      v-show="status.imgLoadStatus"
      class="background"
      alt="background"
      :src="bgUrl"
      :style="{ '--blur': set.backgroundBlur + 'px' }"
      @load="imgLoadComplete"
      @error="imgLoadError"
      @animationend="imgAnimationEnd"
    />
    <Transition name="fade">
      <div v-if="set.showBackgroundGray" class="gray" />
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { statusStore, setStore } from "@/stores";
import { getRandomSakuraWallpaper } from "@/api";

const set = setStore();
const status = statusStore();
const bgUrl = ref(null);
const imgTimeout = ref(null);
const usedBgUrls = new Set();
const maxRetryCount = 5;
const emit = defineEmits(["loadComplete"]);

// 赋值壁纸 —— 打开网站时固定使用随机樱花图片
const setBgUrl = async () => {
  for (let i = 0; i < maxRetryCount; i++) {
    const url = await getRandomSakuraWallpaper();
    if (url && !usedBgUrls.has(url)) {
      usedBgUrls.add(url);
      bgUrl.value = url;
      return;
    }
  }

  // 全部失败或重复命中时，回落到樱花渐变，避免页面停在加载态
  bgUrl.value = "";
  setTimeout(() => {
    status.setImgLoadStatus(true);
    emit("loadComplete");
  }, 400);
};

// 图片加载完成
const imgLoadComplete = () => {
  imgTimeout.value = setTimeout(
    () => {
      status.setImgLoadStatus(true);
    },
    Math.floor(Math.random() * (600 - 300 + 1)) + 300,
  );
};

// 图片动画完成
const imgAnimationEnd = () => {
  console.log("壁纸加载且动画完成");
  // 加载完成事件
  emit("loadComplete");
};

// 图片显示失败 —— 继续换随机樱花，连续失败后落到樱花渐变
const imgLoadError = async () => {
  console.error("壁纸加载失败：", bgUrl.value);
  await setBgUrl();
};

onMounted(() => {
  setBgUrl();
});

onBeforeUnmount(() => {
  clearTimeout(imgTimeout.value);
});
</script>

<style lang="scss" scoped>
.cover {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: var(--body-background-color);
  &.focus {
    .background {
      filter: blur(calc(var(--blur) + 10px)) brightness(0.8);
      transform: scale(1.3);
    }
  }
  .sakura-gradient {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 15% 20%, rgba(255, 183, 197, 0.55), transparent 55%),
      radial-gradient(circle at 85% 25%, rgba(255, 213, 228, 0.45), transparent 55%),
      radial-gradient(circle at 50% 90%, rgba(255, 143, 173, 0.45), transparent 60%),
      linear-gradient(135deg, #ffe4ec 0%, #ffd5e4 40%, #ffb7c5 100%);
  }
  .background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    backface-visibility: hidden;
    transform: scale(1.2);
    filter: blur(var(--blur));
    transition:
      filter 0.3s,
      transform 0.3s;
    animation: fade-blur-in 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .gray {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(rgba(45, 31, 44, 0) 0, rgba(45, 31, 44, 0.45) 100%),
      radial-gradient(rgba(45, 31, 44, 0) 33%, rgba(45, 31, 44, 0.25) 166%);
  }
}
</style>
