<template>
  <div :class="status.siteStatus !== 'normal' ? 'cover focus' : 'cover'">
    <!-- 樱花渐变兜底层 —— 即使图片未加载完成，也保留樱花氛围 -->
    <div class="sakura-gradient" />
    <img
      v-if="set.backgroundType !== 5"
      v-show="status.imgLoadStatus"
      class="background"
      alt="background"
      :src="bgUrl"
      :style="{ '--blur': set.backgroundBlur + 'px' }"
      @load="imgLoadComplete"
      @error.once="imgLoadError"
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

const set = setStore();
const status = statusStore();
const bgUrl = ref(null);
const imgTimeout = ref(null);
const emit = defineEmits(["loadComplete"]);

// 壁纸随机数
// 请依据文件夹内的图片个数修改 Math.random() 后面的第一个数字
const bgRandom = Math.floor(Math.random() * 3 + 1);

// 赋值壁纸
const setBgUrl = () => {
  const { backgroundType } = set;
  switch (backgroundType) {
    case 0:
      bgUrl.value = `/background/bg${bgRandom}.jpg`;
      break;
    case 1: {
      const isMobile = window.innerWidth < 768;
      bgUrl.value = `https://api.dujin.org/bing/${isMobile ? "m" : "1920"}.php`;
      break;
    }
    case 2:
      // 随机风景：picsum.photos
      bgUrl.value = `https://picsum.photos/1920/1080?random=${Date.now()}`;
      break;
    case 3:
      // 随机动漫：dmoe.cc 通过加时间戳防缓存
      bgUrl.value = `https://www.dmoe.cc/random.php?t=${Date.now()}`;
      break;
    case 4:
      bgUrl.value = set.backgroundCustom;
      break;
    case 5:
      // 樱花渐变 —— 不使用图片，直接触发"壁纸已加载"
      bgUrl.value = "";
      setTimeout(() => {
        status.setImgLoadStatus(true);
        emit("loadComplete");
      }, 400);
      break;
    default:
      bgUrl.value = `/background/bg${bgRandom}.jpg`;
      break;
  }
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

// 图片显示失败
const imgLoadError = () => {
  console.error("壁纸加载失败：", bgUrl.value);
  $message.error("壁纸加载失败，已临时切换回默认");
  bgUrl.value = `/background/bg${bgRandom}.jpg`;
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
