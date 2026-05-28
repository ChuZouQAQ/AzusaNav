import axios from "@/utils/request";
import fetchJsonp from "fetch-jsonp";

/**
 * 获取地理位置信息（基于 IP）
 * 主源 ipapi.co，失败时回退 freeipapi.com，均免费、HTTPS、支持 CORS、无需 Key
 * 统一返回: { latitude, longitude, city, country, success }
 */
export const getLocation = async () => {
  // 1) ipapi.co
  try {
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      if (d && !d.error && d.latitude != null && d.longitude != null) {
        return {
          success: true,
          latitude: Number(d.latitude),
          longitude: Number(d.longitude),
          city: d.city,
          country: d.country_name,
        };
      }
    }
  } catch (e) {
    console.warn("ipapi.co 失败，尝试备用源：", e);
  }

  // 2) freeipapi.com 备用
  const res = await fetch("https://free.freeipapi.com/api/json", { cache: "no-store" });
  if (!res.ok) throw new Error(`freeipapi HTTP ${res.status}`);
  const d = await res.json();
  if (d.latitude == null || d.longitude == null) {
    throw new Error("无法解析地理位置数据");
  }
  return {
    success: true,
    latitude: Number(d.latitude),
    longitude: Number(d.longitude),
    city: d.cityName,
    country: d.countryName,
  };
};

/**
 * 获取天气（基于经纬度）
 * 使用 Open-Meteo，免费、HTTPS、支持 CORS、无需 Key
 * https://open-meteo.com/en/docs
 */
export const getWeatherByLatLon = async (latitude, longitude) => {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set(
    "current",
    "temperature_2m,weather_code,wind_speed_10m,wind_direction_10m",
  );
  url.searchParams.set("timezone", "auto");
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`open-meteo HTTP ${res.status}`);
  return res.json();
};

/**
 * 将 Open-Meteo 的 WMO 天气代码转为中文描述
 * https://open-meteo.com/en/docs#weathervariables
 */
export const weatherCodeToText = (code) => {
  const map = {
    0: "晴",
    1: "晴间多云",
    2: "多云",
    3: "阴",
    45: "雾",
    48: "雾凇",
    51: "毛毛雨",
    53: "毛毛雨",
    55: "毛毛雨",
    56: "冻毛毛雨",
    57: "冻毛毛雨",
    61: "小雨",
    63: "中雨",
    65: "大雨",
    66: "冻雨",
    67: "冻雨",
    71: "小雪",
    73: "中雪",
    75: "大雪",
    77: "冰粒",
    80: "阵雨",
    81: "阵雨",
    82: "强阵雨",
    85: "阵雪",
    86: "强阵雪",
    95: "雷雨",
    96: "雷雨伴冰雹",
    99: "雷雨伴冰雹",
  };
  return map[code] ?? "未知";
};

// 角度 → 8 方位中文
export const degreeToWindDir = (deg) => {
  const dirs = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
  return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
};

// km/h → 蒲福风级
export const kmhToBeaufort = (kmh) => {
  const breakpoints = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117];
  for (let i = 0; i < breakpoints.length; i++) {
    if (kmh < breakpoints[i]) return i;
  }
  return 12;
};

/**
 * 获取搜索建议
 * https://suggestion.baidu.com
 * @param {String} keyWord - 搜索关键字
 */
export const getSearchSuggestions = async (keyWord) => {
  try {
    const encodedKeyword = encodeURIComponent(keyWord);
    const response = await fetchJsonp(
      `https://suggestion.baidu.com/su?wd=${encodedKeyword}&cb=json`,
      {
        // 回调参数
        jsonpCallback: "cb",
      },
    );
    const data = await response.json();
    return data.s;
  } catch (error) {
    console.error("处理搜索建议发生错误：", error);
    return null;
  }
};

/**
 * 获取一张随机樱花壁纸
 * 主源: Wallhaven 公开 API（关键字 sakura，随机排序，纯安全 SFW）
 * 备源: 本地 sakuraWallpapers.json 中预置的 Unsplash 直链
 * 优势: 全部 HTTPS，前端可直接使用，无需 API Key
 *
 * @returns {Promise<string>} 一个图片 URL
 */
export const getRandomSakuraWallpaper = async () => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const atleast = isMobile ? "1080x1920" : "1920x1080";
  const ratios = isMobile ? "9x16,9x18,3x4" : "16x9,16x10,21x9";

  // 1) 优先 Wallhaven
  try {
    const url = new URL("https://wallhaven.cc/api/v1/search");
    url.searchParams.set("q", "sakura");
    url.searchParams.set("sorting", "random");
    url.searchParams.set("purity", "100"); // 仅 SFW
    url.searchParams.set("categories", "110"); // General + Anime
    url.searchParams.set("atleast", atleast);
    url.searchParams.set("ratios", ratios);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json?.data) ? json.data : [];
      if (list.length) {
        const pick = list[Math.floor(Math.random() * list.length)];
        if (pick?.path) return pick.path;
      }
    }
  } catch (e) {
    console.warn("Wallhaven 樱花壁纸获取失败，回退本地池：", e);
  }

  // 2) 回退本地预置直链池
  try {
    const pool = (await import("@/assets/sakuraWallpapers.json")).default;
    if (Array.isArray(pool) && pool.length) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  } catch (e) {
    console.error("本地樱花壁纸池加载失败：", e);
  }

  // 3) 最终兜底
  return "";
};
