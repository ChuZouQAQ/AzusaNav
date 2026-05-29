<template>
  <footer id="footer" @click.stop>
    <div class="copyright">
      <span class="site-name">{{ siteName }}</span>
      <i class="sep" aria-hidden="true"></i>
      <span class="year">{{ fullYear }}</span>
      <i class="sep" aria-hidden="true"></i>
      <span class="anthor" @click="jumpTo('https://azusa.uk')">
        {{ siteAnthor }}
      </span>
      <template v-if="icp">
        <i class="sep" aria-hidden="true"></i>
        <span class="icp" @click="jumpTo('https://beian.miit.gov.cn')">
          {{ icp }}
        </span>
      </template>
      <i class="sep" aria-hidden="true"></i>
      <span class="about" @click="aboutSiteModal = true">关于</span>
    </div>
    <!-- 关于 -->
    <n-modal
      preset="card"
      :bordered="false"
      v-model:show="aboutSiteModal"
      transform-origin="center"
    >
      <div class="about-modal">
        <div class="about">
          <span class="emoji">🌸</span>
          <span class="name">{{ siteName }}</span>
          <span class="version">v {{ packageJson.version }}</span>
          <span class="slogan">花影斑驳，让起始页也成为风景</span>
        </div>
        <div class="desc">
          <n-space class="link" justify="center">
            <n-button strong secondary @click="jumpTo('https://github.com/ChuZouQAQ/AzusaNav')">
              Github
            </n-button>
          </n-space>
        </div>
      </div>
    </n-modal>
  </footer>
</template>

<script setup>
import { ref } from "vue";
import { setStore } from "@/stores";
import { NModal, NButton, NSpace } from "naive-ui";
import packageJson from "@/../package.json";

const set = setStore();

// 站点数据
const icp = import.meta.env.VITE_ICP;
const siteName = import.meta.env.VITE_SITE_TITLE;
const siteAnthor = import.meta.env.VITE_SITE_ANTHOR;
const fullYear = new Date().getFullYear();

// 关于弹窗数据
const aboutSiteModal = ref(false);

// 跳转
const jumpTo = (url) => {
  if (set.urlJumpType === "href") {
    window.location.href = url;
  } else if (set.urlJumpType === "open") {
    window.open(url, "_blank");
  }
};
</script>

<style lang="scss" scoped>
#footer {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 0;
  height: 56px;
  width: 100%;
  color: var(--main-text-color);
  z-index: 1;
  text-shadow: var(--main-text-shadow);
  pointer-events: none;
  .copyright {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 7px 18px;
    font-size: 13px;
    line-height: 1;
    pointer-events: auto;
    border-radius: var(--r-pill);
    background-color: var(--main-background-light-color);
    border: 1px solid transparent;
    backdrop-filter: blur(14px) saturate(1.3);
    box-shadow: 0 6px 20px rgba(90, 45, 63, 0.18);
    transition:
      border-color 0.3s,
      box-shadow 0.3s,
      transform 0.3s;
    animation: fade-up-in 0.8s ease;
    &:hover {
      border-color: var(--main-border-color);
      box-shadow: var(--sakura-glow);
      transform: translateY(-2px);
    }
    span {
      opacity: 0.82;
      transition:
        opacity 0.3s,
        color 0.3s;
    }
    /* 樱花点分隔符 */
    .sep {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--sakura-300);
      opacity: 0.55;
      flex-shrink: 0;
    }
    .site-name {
      font-weight: 600;
      letter-spacing: 0.5px;
      opacity: 1;
      &::before {
        content: "🌸";
        margin-right: 6px;
        font-size: 12px;
      }
    }
    .year {
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.5px;
    }
    .anthor,
    .icp,
    .about {
      cursor: pointer;
      &:hover {
        opacity: 1;
        color: var(--sakura-300);
        text-shadow: 0 0 12px rgba(255, 143, 173, 0.6);
      }
    }
  }
}
.about-modal {
  margin-bottom: 10px;
  .about {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    .emoji {
      font-size: 40px;
      margin-bottom: 8px;
      animation: logo-breathe 3s infinite alternate;
    }
    .name {
      font-size: 26px;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .version {
      opacity: 0.6;
      font-size: 14px;
    }
    .slogan {
      margin-top: 12px;
      font-size: 13px;
      opacity: 0.7;
      letter-spacing: 1px;
    }
  }
  .desc {
    margin-top: 20px;
  }
}
</style>
