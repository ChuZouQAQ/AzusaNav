<template>
  <Provider>
    <!-- 壁纸 -->
    <Cover @loadComplete="loadComplete" />
    <!-- 樱花飘落装饰层 -->
    <SakuraFall v-if="status.imgLoadStatus" />
    <!-- 主界面 -->
    <Transition name="fade" mode="out-in">
      <main
        v-if="status.imgLoadStatus"
        tabindex="0"
        id="main"
        :class="`main-${status.siteStatus}`"
        :style="{ pointerEvents: mainClickable ? 'auto' : 'none' }"
        @click="status.setSiteStatus('normal')"
        @contextmenu="mainContextmenu"
        @keydown="mainPressKeyboard"
      >
        <WeatherTime />
        <SearchInp @contextmenu.stop />
        <AllFunc @contextmenu.stop />
        <Footer />

        <!-- 顶部控制栏：仅在盒子 / 设置 状态显示，避免遮挡首页 -->
        <Transition name="fade">
          <div
            class="all-controls"
            v-show="status.siteStatus !== 'focus' && status.siteStatus !== 'normal'"
          >
            <div
              class="change-status"
              :title="status.mainBoxBig ? '收起面板 (Ctrl+↓)' : '展开面板 (Ctrl+↑)'"
              @click.stop="status.setMainBoxBig(!status.mainBoxBig)"
            >
              <Transition name="fade" mode="out-in">
                <SvgIcon
                  :iconName="`icon-${status.mainBoxBig ? 'packup' : 'unfold'}`"
                  :key="status.mainBoxBig ? 'packup' : 'unfold'"
                />
              </Transition>
            </div>
            <div
              class="change-status"
              :title="status.siteStatus !== 'set' ? '打开设置 (Ctrl+,)' : '返回首页 (Esc)'"
              @click.stop="status.setSiteStatus(status.siteStatus !== 'set' ? 'set' : 'normal')"
            >
              <Transition name="fade" mode="out-in">
                <SvgIcon
                  :iconName="`icon-${status.siteStatus !== 'set' ? 'setting' : 'home'}`"
                  :key="status.siteStatus !== 'set' ? 'setting' : 'home'"
                />
              </Transition>
            </div>
          </div>
        </Transition>

        <!-- 首页常驻悬浮按钮：让用户更容易发现"主菜单/设置" -->
        <Transition name="fadeUp">
          <div
            v-show="status.siteStatus === 'normal'"
            class="home-fab"
            @click.stop
          >
            <button
              class="fab-btn"
              title="主菜单 (右键 / 空格)"
              @click="status.setSiteStatus('box')"
            >
              <SvgIcon iconName="icon-unfold" />
              <span class="fab-label">主菜单</span>
            </button>
            <button
              class="fab-btn"
              title="设置 (Ctrl+,)"
              @click="status.setSiteStatus('set')"
            >
              <SvgIcon iconName="icon-setting" />
              <span class="fab-label">设置</span>
            </button>
          </div>
        </Transition>
      </main>
      <div v-else id="loading">
        <div class="logo-wrap">
          <img src="/icon/logo.png" alt="logo" class="logo" />
          <span class="ring" />
        </div>
        <span class="tip">樱花正在飘落…</span>
      </div>
    </Transition>
  </Provider>
</template>

<script setup>
import { onMounted, onBeforeUnmount, nextTick, watch, ref } from "vue";
import { statusStore, setStore } from "@/stores";
import { getGreeting } from "@/utils/timeTools";
import Provider from "@/components/Provider.vue";
import Cover from "@/components/Cover.vue";
import SakuraFall from "@/components/SakuraFall.vue";
import WeatherTime from "@/components/WeatherTime.vue";
import SearchInp from "@/components/SearchInput/SearchInp.vue";
import AllFunc from "@/components/AllFunc/AllFunc.vue";
import Footer from "@/components/Footer.vue";

const set = setStore();
const status = statusStore();
const mainClickable = ref(false);

// 获取配置
const welcomeText = import.meta.env.VITE_WELCOME_TEXT ?? "欢迎访问本站";

// 鼠标右键 —— 打开主菜单
const mainContextmenu = (event) => {
  event.preventDefault();
  status.setSiteStatus("box");
};

// 加载完成事件
const loadComplete = () => {
  nextTick().then(() => {
    mainClickable.value = true;
    $message.info(getGreeting() + "，" + welcomeText, {
      showIcon: false,
      duration: 3000,
    });
  });
};

// 全局键盘事件（main 内部）
const mainPressKeyboard = (event) => {
  const keyCode = event.keyCode;
  // 回车：聚焦搜索框
  if (keyCode === 13) {
    const mainInput = document.getElementById("main-input");
    status.setSiteStatus("focus");
    mainInput?.focus();
  }
};

// 全局快捷键（document 级别，不受焦点限制）
const handleGlobalKeydown = (event) => {
  // 输入框内不拦截普通键
  const tag = (event.target?.tagName || "").toLowerCase();
  const isTyping = tag === "input" || tag === "textarea";

  // Esc —— 一律回到首页
  if (event.key === "Escape") {
    if (status.engineChangeStatus) {
      status.setEngineChangeStatus(false);
      return;
    }
    if (status.siteStatus !== "normal") {
      status.setSiteStatus("normal");
      document.getElementById("main-input")?.blur();
    }
    return;
  }

  // Ctrl + , —— 打开设置
  if (event.ctrlKey && event.key === ",") {
    event.preventDefault();
    status.setSiteStatus(status.siteStatus === "set" ? "normal" : "set");
    return;
  }

  // Ctrl + B —— 打开主菜单（盒子）
  if (event.ctrlKey && event.key.toLowerCase() === "b") {
    event.preventDefault();
    status.setSiteStatus(status.siteStatus === "box" ? "normal" : "box");
    return;
  }

  // Ctrl + ↑ / ↓ —— 在盒子/设置时展开收起
  if (event.ctrlKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
    if (status.siteStatus === "box" || status.siteStatus === "set") {
      event.preventDefault();
      status.setMainBoxBig(event.key === "ArrowUp");
    }
    return;
  }

  // / —— 聚焦搜索框（输入中不触发）
  if (event.key === "/" && !isTyping) {
    event.preventDefault();
    const mainInput = document.getElementById("main-input");
    status.setSiteStatus("focus");
    mainInput?.focus();
    return;
  }

  // 空格 —— 打开主菜单（仅在 normal 状态且未在输入）
  if (event.code === "Space" && !isTyping && status.siteStatus === "normal") {
    event.preventDefault();
    status.setSiteStatus("box");
  }
};

// 根据主题类别更改
const changeThemeType = (val) => {
  const htmlElement = document.querySelector("html");
  const themeType = val === "light" ? "light" : "dark";
  htmlElement.setAttribute("theme", themeType);
};

// 监听颜色变化
watch(
  () => set.themeType,
  (val) => changeThemeType(val),
);

onMounted(() => {
  changeThemeType(set.themeType);
  window.addEventListener("keydown", handleGlobalKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleGlobalKeydown);
});
</script>

<style lang="scss" scoped>
#main,
#loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &.main-normal,
  &.main-focus {
    .main-box {
      opacity: 0;
      margin-top: 0;
      transform: scale(0.35);
      pointer-events: none;
    }
  }
  &.main-box,
  &.main-set {
    .main-box {
      opacity: 1;
      margin-top: 20vh;
      transform: scale(1);
      visibility: visible;
      @media (max-width: 478px) {
        margin-top: 22vh;
      }
    }
    .search-input {
      :deep(.all) {
        opacity: 0;
        width: 0;
        visibility: hidden;
      }
    }
  }
  .all-controls {
    position: fixed;
    width: 100%;
    top: 0;
    padding: 14px 18px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    z-index: 3;
    .change-status {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      width: 44px;
      height: 44px;
      border-radius: var(--r-md);
      color: var(--main-text-color);
      background-color: var(--main-background-light-color);
      backdrop-filter: blur(20px);
      border: 1px solid var(--main-border-color);
      box-shadow: var(--main-box-shadow);
      transition:
        opacity 0.3s,
        background-color 0.3s,
        transform 0.3s,
        box-shadow 0.3s;
      &:hover {
        background-color: var(--main-background-hover-color);
        box-shadow: var(--sakura-glow);
        transform: translateY(-1px);
      }
      &:active {
        transform: scale(0.95);
      }
    }
  }

  /* 首页悬浮主菜单按钮 */
  .home-fab {
    position: fixed;
    right: 24px;
    bottom: 70px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 2;
    .fab-btn {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      font-size: 14px;
      color: var(--main-text-color);
      background-color: var(--main-background-light-color);
      border: 1px solid var(--main-border-color);
      backdrop-filter: blur(20px);
      border-radius: var(--r-pill);
      box-shadow: var(--main-box-shadow);
      transition:
        background-color 0.3s,
        transform 0.2s,
        box-shadow 0.3s;
      .i-icon {
        font-size: 18px;
      }
      .fab-label {
        font-weight: 500;
      }
      &:hover {
        background-color: var(--main-background-hover-color);
        box-shadow: var(--sakura-glow);
        transform: translateY(-2px);
      }
      &:active {
        transform: scale(0.97);
      }
    }
    @media (max-width: 478px) {
      right: 16px;
      bottom: 64px;
      .fab-btn .fab-label {
        display: none;
      }
      .fab-btn {
        padding: 10px;
      }
    }
  }
}

#loading {
  color: var(--main-text-color);
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 183, 197, 0.45), transparent 60%),
    radial-gradient(circle at 80% 80%, rgba(255, 143, 173, 0.35), transparent 60%),
    var(--body-background-color);
  .logo-wrap {
    position: relative;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 28px;
    .logo {
      width: 88px;
      height: 88px;
      animation: logo-breathe 3s infinite alternate;
      filter: drop-shadow(0 4px 16px rgba(240, 98, 146, 0.45));
    }
    .ring {
      position: absolute;
      inset: 0;
      border: 2px dashed var(--sakura-300);
      border-radius: 50%;
      animation: ring-spin 8s linear infinite;
      opacity: 0.7;
    }
  }
  .tip {
    font-size: 18px;
    letter-spacing: 2px;
    opacity: 0.85;
  }
}

@keyframes ring-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
