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
