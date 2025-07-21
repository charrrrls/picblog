// 背景更新功能使用示例
// 在浏览器控制台中可以直接使用这些方法

// ===== 基础使用方法 =====

// 1. 获取当前背景配置
async function getCurrentBackground() {
  const result = await app.fetchRemoteBackground();
  console.log('当前背景配置:', result);
}

// 2. 更新背景配置
async function updateBackground() {
  const newConfig = {
    pc: {
      type: "pic",
      datainfo: {
        title: "自定义PC背景",
        preview: "https://example.com/preview.jpg",
        url: "https://example.com/background.jpg"
      }
    },
    mobile: {
      type: "pic", 
      datainfo: {
        title: "自定义移动端背景",
        preview: "https://example.com/mobile-preview.jpg",
        url: "https://example.com/mobile-background.jpg"
      }
    }
  };
  
  const result = await app.updateRemoteBackground(newConfig);
  console.log('更新结果:', result);
}

// 3. 应用预设主题
async function applyOceanTheme() {
  const result = await app.applyPresetBackground('ocean_girl');
  console.log('应用海洋主题结果:', result);
}

async function applyVideoTheme() {
  const result = await app.applyPresetBackground('nier_automata');
  console.log('应用动态主题结果:', result);
}

// 4. 同步当前用户背景到远程
async function syncCurrentToRemote() {
  const result = await app.syncCurrentBackgroundToRemote();
  console.log('同步结果:', result);
}

// ===== 使用背景管理器的高级方法 =====

// 5. 切换到网络壁纸
async function switchToNetworkWallpaper() {
  const result = await app.backgroundManager.switchToNetworkWallpaper(
    'https://example.com/pc-wallpaper.jpg',
    'https://example.com/mobile-wallpaper.jpg',
    '网络壁纸'
  );
  console.log('切换网络壁纸结果:', result);
}

// 6. 切换到本地壁纸
async function switchToLocalWallpaper() {
  const result = await app.backgroundManager.switchToLocalWallpaper(
    '/img/wallpaper/static/书房夜晚/image.png',
    '/img/wallpaper/static-mobile/0002/image.png',
    '书房夜晚'
  );
  console.log('切换本地壁纸结果:', result);
}

// 7. 切换到动态壁纸
async function switchToVideoWallpaper() {
  const result = await app.backgroundManager.switchToVideoWallpaper(
    '/img/wallpaper/dynamic/向往航天的女孩/Toy-Aeroplane.webm',
    '/img/wallpaper/dynamic-mobile/chuva/chuva.mp4',
    '航天女孩'
  );
  console.log('切换动态壁纸结果:', result);
}

// 8. 随机切换背景
async function randomBackground() {
  const result = await app.backgroundManager.randomBackground();
  console.log('随机背景结果:', result);
}

// 9. 启动自动切换背景（每30分钟）
function startAutoSwitch() {
  app.backgroundManager.startAutoSwitch(30);
  console.log('已启动自动切换背景');
}

// 10. 停止自动切换
function stopAutoSwitch() {
  app.backgroundManager.stopAutoSwitch();
  console.log('已停止自动切换背景');
}

// ===== 管理功能 =====

// 11. 备份当前背景
function backupBackground() {
  const backup = app.backgroundManager.backupCurrentBackground();
  console.log('已备份背景:', backup);
}

// 12. 恢复备份的背景
async function restoreBackground() {
  const result = await app.backgroundManager.restoreBackgroundFromBackup();
  console.log('恢复备份结果:', result);
}

// 13. 查看背景使用统计
function viewBackgroundStats() {
  const stats = app.backgroundManager.getBackgroundStats();
  console.log('背景使用统计:', stats);
  
  const mostUsed = app.backgroundManager.getMostUsedBackground();
  console.log('最常用背景:', mostUsed);
}

// ===== 在浏览器控制台中的使用方法 =====

/*
打开浏览器开发者工具，在控制台中输入以下命令：

// 获取应用实例
const app = document.querySelector('#app').__vue__;

// 1. 查看当前背景配置
await app.fetchRemoteBackground();

// 2. 切换到海洋主题
await app.applyPresetBackground('ocean_girl');

// 3. 切换到动态主题  
await app.applyPresetBackground('nier_automata');

// 4. 自定义背景
const customConfig = {
  pc: {
    type: "pic",
    datainfo: {
      title: "我的自定义背景",
      preview: "https://your-image-url.com/preview.jpg",
      url: "https://your-image-url.com/full.jpg"
    }
  },
  mobile: {
    type: "pic",
    datainfo: {
      title: "移动端自定义背景", 
      preview: "https://your-mobile-image.com/preview.jpg",
      url: "https://your-mobile-image.com/full.jpg"
    }
  }
};
await app.updateRemoteBackground(customConfig);

// 5. 使用背景管理器的便捷方法
await app.backgroundManager.switchToNetworkWallpaper(
  'PC壁纸URL',
  '移动端壁纸URL',
  '壁纸标题'
);

// 6. 启动自动切换（每小时）
app.backgroundManager.startAutoSwitch(60);

// 7. 查看统计信息
app.backgroundManager.getBackgroundStats();
*/

// ===== 批量操作示例 =====

// 批量测试所有预设主题
async function testAllPresets() {
  const presets = ['ocean_girl', 'nier_automata'];
  
  for (const preset of presets) {
    console.log(`正在测试预设: ${preset}`);
    const result = await app.applyPresetBackground(preset);
    console.log(`结果:`, result);
    
    // 等待3秒再切换下一个
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

// 创建一个背景轮播
async function createBackgroundSlideshow() {
  const backgrounds = [
    {
      pc: { type: "pic", datainfo: { title: "背景1", preview: "/img/wallpaper/static/海洋女孩/image-pre.webp", url: "/img/wallpaper/static/海洋女孩/image.png" }},
      mobile: { type: "pic", datainfo: { title: "背景1", preview: "/img/wallpaper/static-mobile/0001/image-pre.webp", url: "/img/wallpaper/static-mobile/0001/image.png" }}
    },
    {
      pc: { type: "pic", datainfo: { title: "背景2", preview: "/img/wallpaper/static/书房夜晚/image-pre.webp", url: "/img/wallpaper/static/书房夜晚/image.png" }},
      mobile: { type: "pic", datainfo: { title: "背景2", preview: "/img/wallpaper/static-mobile/0002/image-pre.webp", url: "/img/wallpaper/static-mobile/0002/image.png" }}
    }
  ];
  
  let currentIndex = 0;
  
  const slideshow = setInterval(async () => {
    const background = backgrounds[currentIndex];
    await app.updateRemoteBackground(background);
    console.log(`切换到背景 ${currentIndex + 1}`);
    
    currentIndex = (currentIndex + 1) % backgrounds.length;
  }, 10000); // 每10秒切换一次
  
  console.log('背景轮播已启动，每10秒切换一次');
  
  // 返回停止函数
  return () => {
    clearInterval(slideshow);
    console.log('背景轮播已停止');
  };
}

// 导出所有示例函数
window.backgroundExamples = {
  getCurrentBackground,
  updateBackground,
  applyOceanTheme,
  applyVideoTheme,
  syncCurrentToRemote,
  switchToNetworkWallpaper,
  switchToLocalWallpaper,
  switchToVideoWallpaper,
  randomBackground,
  startAutoSwitch,
  stopAutoSwitch,
  backupBackground,
  restoreBackground,
  viewBackgroundStats,
  testAllPresets,
  createBackgroundSlideshow
};

console.log('背景管理示例已加载，使用 window.backgroundExamples 访问所有方法');
