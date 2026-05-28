<template>
  <!-- 樱花飘落装饰层 —— 纯 CSS 动画，不阻塞交互 -->
  <div v-if="enabled" class="sakura-fall" aria-hidden="true">
    <span
      v-for="(p, i) in petals"
      :key="i"
      class="petal"
      :style="{
        left: p.left + 'vw',
        top: p.top + 'vh',
        '--drift': p.drift + 'px',
        '--size': p.size + 'px',
        animationDelay: p.delay + 's',
        animationDuration: p.duration + 's',
        opacity: p.opacity,
      }"
    >
      <svg viewBox="0 0 32 32" :width="p.size" :height="p.size">
        <!-- 五瓣樱花 SVG，色相略有差异 -->
        <g :fill="p.color">
          <path
            d="M16 2C12.5 5 13 9 16 12C19 9 19.5 5 16 2Z"
            transform="rotate(0 16 16)"
          />
          <path
            d="M16 2C12.5 5 13 9 16 12C19 9 19.5 5 16 2Z"
            transform="rotate(72 16 16)"
          />
          <path
            d="M16 2C12.5 5 13 9 16 12C19 9 19.5 5 16 2Z"
            transform="rotate(144 16 16)"
          />
          <path
            d="M16 2C12.5 5 13 9 16 12C19 9 19.5 5 16 2Z"
            transform="rotate(216 16 16)"
          />
          <path
            d="M16 2C12.5 5 13 9 16 12C19 9 19.5 5 16 2Z"
            transform="rotate(288 16 16)"
          />
          <circle cx="16" cy="16" r="1.6" fill="#ffd5e4" />
        </g>
      </svg>
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { setStore } from "@/stores";

const set = setStore();

// 是否启用樱花飘落（受设置控制，默认开启）
const enabled = computed(() => set.showSakura !== false);

// 樱花数量（默认 18 片，移动端自动减半）
const count = computed(() => {
  if (typeof window === "undefined") return 18;
  return window.innerWidth < 768 ? 10 : 18;
});

// 颜色列表 —— 几种深浅不同的樱花粉
const colors = [
  "#ffb7c5",
  "#ffc8d4",
  "#ffd5e4",
  "#ff8fad",
  "#ffe4ec",
];

// 随机生成花瓣
const random = (min, max) => Math.random() * (max - min) + min;

const petals = computed(() => {
  return Array.from({ length: count.value }).map(() => ({
    left: random(0, 100),
    top: random(-20, 0),
    size: random(14, 26),
    drift: random(-160, 160),
    delay: random(0, 12),
    duration: random(12, 22),
    opacity: random(0.55, 0.95),
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
});
</script>

<style lang="scss" scoped>
.sakura-fall {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
  .petal {
    position: absolute;
    display: inline-block;
    will-change: transform, opacity;
    animation: sakura-fall linear infinite;
    filter: drop-shadow(0 1px 2px rgba(240, 98, 146, 0.25));
  }
}
</style>
