<template>
  <v-dialog 
    :model-value="visible"
    @update:model-value="updateVisible"
    fullscreen 
    transition="dialog-bottom-transition"
    style="z-index: 9999;"
  >
    <v-card style="background: rgba(0,0,0,0.95);">
      <!-- 顶部工具栏 -->
      <v-app-bar 
        color="transparent" 
        density="compact"
        style="background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);"
      >
        <v-btn 
          icon="mdi-close" 
          @click="closeViewer"
          color="white"
        ></v-btn>
        
        <v-spacer></v-spacer>
        
        <div style="color: white; font-size: 14px; margin-right: 16px;">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>

        <v-btn
          icon="mdi-download"
          @click="downloadImage"
          color="white"
        ></v-btn>
      </v-app-bar>

      <!-- 主要内容区域 -->
      <v-main style="padding: 0; height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">

          <!-- 左箭头 -->
          <v-btn
            v-if="images.length > 1"
            icon="mdi-chevron-left"
            size="large"
            color="white"
            variant="text"
            style="position: absolute; left: 20px; z-index: 1000;"
            @click="previousImage"
          ></v-btn>

          <!-- 图片容器 - 优化尺寸显示 -->
          <div
            :style="imageContainerStyle"
            @click="toggleUI"
          >
            <!-- 加载状态 -->
            <div v-if="loading" style="text-align: center;">
              <v-progress-circular 
                indeterminate 
                color="white" 
                size="60"
              ></v-progress-circular>
              <p style="color: white; margin-top: 20px;">加载中...</p>
            </div>

            <!-- 错误状态 -->
            <div v-else-if="error" style="text-align: center; color: white;">
              <v-icon size="60" color="white">mdi-image-broken-variant</v-icon>
              <p style="margin-top: 20px;">图片加载失败</p>
              <v-btn 
                @click="retryLoad"
                variant="outlined"
                color="white"
                style="margin-top: 10px;"
              >
                重试
              </v-btn>
            </div>

            <!-- 实际图片 - 优化显示尺寸 -->
            <transition name="fade" mode="out-in">
              <img
                v-if="!loading && !error && currentImage && imageCache.has(currentImage.src)"
                :key="currentIndex"
                :src="currentImage.src"
                :alt="currentImage.alt"
                :style="imageStyle"
                @load="onImageLoad"
                @error="onImageError"
                ref="mainImage"
              />
            </transition>
          </div>

          <!-- 右箭头 -->
          <v-btn
            v-if="images.length > 1"
            icon="mdi-chevron-right"
            size="large"
            color="white"
            variant="text"
            style="position: absolute; right: 20px; z-index: 1000;"
            @click="nextImage"
          ></v-btn>

          <!-- EXIF信息面板 -->
          <div
            v-if="showExifPanel && currentExifData"
            class="exif-panel"
            :class="{ 'exif-panel-visible': showExifPanel }"
          >
            <div class="exif-header">
              <h4>📷 拍摄信息</h4>
              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                color="white"
                @click="showExifPanel = false"
              ></v-btn>
            </div>

            <div class="exif-content">
              <div v-if="currentExifData.camera" class="exif-item">
                <span class="exif-label">相机型号</span>
                <span class="exif-value">{{ currentExifData.camera }}</span>
              </div>

              <div v-if="currentExifData.lens" class="exif-item">
                <span class="exif-label">镜头</span>
                <span class="exif-value">{{ currentExifData.lens }}</span>
              </div>

              <div v-if="currentExifData.dateTime" class="exif-item">
                <span class="exif-label">拍摄时间</span>
                <span class="exif-value">{{ currentExifData.dateTime }}</span>
              </div>

              <div v-if="currentExifData.aperture" class="exif-item">
                <span class="exif-label">光圈</span>
                <span class="exif-value">f/{{ currentExifData.aperture }}</span>
              </div>

              <div v-if="currentExifData.shutterSpeed" class="exif-item">
                <span class="exif-label">快门速度</span>
                <span class="exif-value">{{ currentExifData.shutterSpeed }}s</span>
              </div>

              <div v-if="currentExifData.iso" class="exif-item">
                <span class="exif-label">ISO</span>
                <span class="exif-value">{{ currentExifData.iso }}</span>
              </div>

              <div v-if="currentExifData.focalLength" class="exif-item">
                <span class="exif-label">焦距</span>
                <span class="exif-value">{{ currentExifData.focalLength }}mm</span>
              </div>

              <div v-if="currentExifData.dimensions" class="exif-item">
                <span class="exif-label">尺寸</span>
                <span class="exif-value">{{ currentExifData.dimensions }}</span>
              </div>
            </div>
          </div>
        </div>
      </v-main>

      <!-- 底部信息栏 -->
      <div
        v-if="showUI && currentImage"
        class="image-info-bar"
      >
        <div class="image-info-content">
          <h3 style="margin: 0 0 8px 0;">{{ currentImage.title || currentImage.alt }}</h3>
          <p style="margin: 0; opacity: 0.8; font-size: 14px;">
            {{ formatFileSize(currentImage.size) }}
            {{ currentImage.dimensions ? ` • ${currentImage.dimensions}` : '' }}
          </p>
        </div>

        <!-- EXIF信息按钮 -->
        <div class="image-info-actions">
          <v-btn
            v-if="hasExifData"
            icon="mdi-camera-iris"
            size="small"
            color="white"
            variant="text"
            @click="toggleExifPanel"
            class="exif-button"
          >
            <v-tooltip activator="parent" location="top">查看拍摄信息</v-tooltip>
          </v-btn>
        </div>
      </div>

      <!-- 缩略图导航栏 -->
      <div 
        v-if="showUI && images.length > 1"
        style="
          position: absolute; 
          bottom: 80px; 
          left: 50%; 
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          padding: 12px;
          background: rgba(0,0,0,0.6);
          border-radius: 8px;
          max-width: 80%;
          overflow-x: auto;
        "
      >
        <div
          v-for="(image, index) in images"
          :key="index"
          :class="['thumbnail-nav-item', { active: index === currentIndex }]"
          @click="goToImage(index)"
        >
          <img 
            :src="image.thumbnailSrc || image.src" 
            :alt="image.alt"
            style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
          />
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  name: 'ImageViewer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    images: {
      type: Array,
      default: () => []
    },
    initialIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      currentIndex: 0,
      loading: true, // 初始状态为加载中
      error: false,
      showUI: true,
      uiTimeout: null,
      loadTimeout: null,
      imageCache: new Map(), // 添加图片缓存
      exifCache: new Map(), // EXIF数据缓存
      currentExifData: null, // 当前图片的EXIF数据
      showExifPanel: false, // 是否显示EXIF面板
      windowHeight: window.innerHeight, // 窗口高度
      windowWidth: window.innerWidth, // 窗口宽度
      imageNaturalWidth: 0, // 图片原始宽度
      imageNaturalHeight: 0 // 图片原始高度
    };
  },
  computed: {
    currentImage() {
      return this.images[this.currentIndex] || null;
    },

    // 计算图片容器样式
    imageContainerStyle() {
      return {
        maxWidth: '95%',
        maxHeight: '85vh', // 确保在视窗高度内显示
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      };
    },

    // 计算图片样式
    imageStyle() {
      return {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        display: 'block'
      };
    },

    // 是否有EXIF数据
    hasExifData() {
      return this.currentExifData && Object.keys(this.currentExifData).length > 0;
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.currentIndex = this.initialIndex;
        this.loadCurrentImage();
        this.showUI = true;
        this.startUITimeout();

        // 添加键盘事件监听
        document.addEventListener('keydown', this.handleKeydown);
        document.addEventListener('resize', this.handleResize);
      } else {
        // 移除键盘事件监听
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('resize', this.handleResize);
        this.clearUITimeout();
        this.clearLoadTimeout();
        this.showExifPanel = false;
      }
    },
    currentIndex() {
      this.loadCurrentImage();
      this.showExifPanel = false; // 切换图片时关闭EXIF面板
    }
  },

  mounted() {
    this.updateWindowSize();
  },

  beforeUnmount() {
    // 清理所有超时和事件监听
    this.clearUITimeout();
    this.clearLoadTimeout();
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('resize', this.handleResize);
  },
  methods: {
    closeViewer() {
      this.updateVisible(false);
    },

    updateVisible(value) {
      this.$emit('update:visible', value);
    },
    
    loadCurrentImage() {
      if (!this.currentImage) return;

      const imageUrl = this.currentImage.src;

      // 检查缓存
      if (this.imageCache.has(imageUrl)) {
        this.loading = false;
        this.error = false;
        this.loadExifData(imageUrl);
        return;
      }

      this.loading = true;
      this.error = false;
      this.currentExifData = null;

      // 清除之前的超时
      if (this.loadTimeout) {
        clearTimeout(this.loadTimeout);
      }

      // 设置加载超时（15秒）
      this.loadTimeout = setTimeout(() => {
        this.loading = false;
        this.error = true;
        console.error('图片加载超时:', imageUrl);
      }, 15000);

      // 预加载图片
      const img = new Image();
      img.crossOrigin = 'anonymous'; // 允许跨域读取EXIF
      img.onload = () => {
        // 清除超时
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }

        // 记录图片原始尺寸
        this.imageNaturalWidth = img.naturalWidth;
        this.imageNaturalHeight = img.naturalHeight;

        // 添加到缓存
        this.imageCache.set(imageUrl, true);

        this.loading = false;
        this.error = false;

        // 加载EXIF数据
        this.loadExifData(imageUrl, img);
      };

      img.onerror = () => {
        // 清除超时
        if (this.loadTimeout) {
          clearTimeout(this.loadTimeout);
          this.loadTimeout = null;
        }

        this.loading = false;
        this.error = true;
        console.error('图片加载失败:', imageUrl);
      };

      // 开始加载图片
      img.src = imageUrl;
    },
    
    onImageLoad() {
      // 图片在DOM中加载完成（备用）
      this.loading = false;
      this.error = false;

      // 获取图片原始尺寸
      if (this.$refs.mainImage) {
        const img = this.$refs.mainImage;
        this.imageNaturalWidth = img.naturalWidth;
        this.imageNaturalHeight = img.naturalHeight;

        // 如果还没有EXIF数据，尝试从DOM元素获取
        if (!this.currentExifData && this.currentImage) {
          this.loadExifData(this.currentImage.src, img);
        }
      }
    },

    onImageError() {
      // 图片在DOM中加载失败（备用）
      this.loading = false;
      this.error = true;
    },

    // 加载EXIF数据
    loadExifData(imageUrl, imgElement) {
      // 检查缓存
      if (this.exifCache.has(imageUrl)) {
        this.currentExifData = this.exifCache.get(imageUrl);
        return;
      }

      // 尝试使用EXIF.js读取EXIF数据
      try {
        if (imgElement) {
          EXIF.getData(imgElement, () => {
            const exifData = this.extractExifData(imgElement);
            if (exifData && Object.keys(exifData).length > 0) {
              this.exifCache.set(imageUrl, exifData);
              this.currentExifData = exifData;
            } else {
              // 尝试使用piexifjs作为备选
              this.tryPiexifExtraction(imageUrl);
            }
          });
        } else {
          // 如果没有图片元素，创建一个
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            EXIF.getData(img, () => {
              const exifData = this.extractExifData(img);
              if (exifData && Object.keys(exifData).length > 0) {
                this.exifCache.set(imageUrl, exifData);
                this.currentExifData = exifData;
              } else {
                // 尝试使用piexifjs作为备选
                this.tryPiexifExtraction(imageUrl);
              }
            });
          };
          img.src = imageUrl;
        }
      } catch (error) {
        console.error('读取EXIF数据失败:', error);
        this.tryPiexifExtraction(imageUrl);
      }
    },

    // 尝试使用piexifjs提取EXIF数据
    tryPiexifExtraction(imageUrl) {
      try {
        fetch(imageUrl)
          .then(response => response.arrayBuffer())
          .then(buffer => {
            const binary = '';
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }

            try {
              const exifObj = piexif.load(binary);
              const exifData = this.extractPiexifData(exifObj);
              if (exifData && Object.keys(exifData).length > 0) {
                this.exifCache.set(imageUrl, exifData);
                this.currentExifData = exifData;
              } else {
                // 如果两种方法都失败，创建基本信息
                this.createBasicExifData();
              }
            } catch (e) {
              console.error('Piexif解析失败:', e);
              this.createBasicExifData();
            }
          })
          .catch(error => {
            console.error('获取图片数据失败:', error);
            this.createBasicExifData();
          });
      } catch (error) {
        console.error('Piexif处理失败:', error);
        this.createBasicExifData();
      }
    },
    
    // 从EXIF.js提取数据
    extractExifData(imgElement) {
      const exifData = {};

      // 相机制造商和型号
      const make = EXIF.getTag(imgElement, 'Make');
      const model = EXIF.getTag(imgElement, 'Model');
      if (make && model) {
        exifData.camera = `${make} ${model}`;
      } else if (model) {
        exifData.camera = model;
      }

      // 镜头信息
      const lensModel = EXIF.getTag(imgElement, 'LensModel');
      if (lensModel) {
        exifData.lens = lensModel;
      }

      // 拍摄时间
      const dateTime = EXIF.getTag(imgElement, 'DateTime') || EXIF.getTag(imgElement, 'DateTimeOriginal');
      if (dateTime) {
        exifData.dateTime = this.formatDateTime(dateTime);
      }

      // 光圈
      const aperture = EXIF.getTag(imgElement, 'FNumber');
      if (aperture) {
        exifData.aperture = aperture;
      }

      // 快门速度
      const shutterSpeed = EXIF.getTag(imgElement, 'ExposureTime');
      if (shutterSpeed) {
        exifData.shutterSpeed = this.formatShutterSpeed(shutterSpeed);
      }

      // ISO
      const iso = EXIF.getTag(imgElement, 'ISOSpeedRatings');
      if (iso) {
        exifData.iso = iso;
      }

      // 焦距
      const focalLength = EXIF.getTag(imgElement, 'FocalLength');
      if (focalLength) {
        exifData.focalLength = focalLength;
      }

      // 图片尺寸
      if (this.imageNaturalWidth && this.imageNaturalHeight) {
        exifData.dimensions = `${this.imageNaturalWidth} × ${this.imageNaturalHeight}`;
      }

      return exifData;
    },

    // 从piexifjs提取数据
    extractPiexifData(exifObj) {
      const exifData = {};

      try {
        // 相机信息
        if (exifObj['0th'] && exifObj['0th'][piexif.ImageIFD.Make] && exifObj['0th'][piexif.ImageIFD.Model]) {
          exifData.camera = `${exifObj['0th'][piexif.ImageIFD.Make]} ${exifObj['0th'][piexif.ImageIFD.Model]}`;
        }

        // 拍摄时间
        if (exifObj['Exif'] && exifObj['Exif'][piexif.ExifIFD.DateTimeOriginal]) {
          exifData.dateTime = this.formatDateTime(exifObj['Exif'][piexif.ExifIFD.DateTimeOriginal]);
        }

        // 光圈
        if (exifObj['Exif'] && exifObj['Exif'][piexif.ExifIFD.FNumber]) {
          const fNumber = exifObj['Exif'][piexif.ExifIFD.FNumber];
          if (Array.isArray(fNumber) && fNumber.length === 2) {
            exifData.aperture = (fNumber[0] / fNumber[1]).toFixed(1);
          }
        }

        // 快门速度
        if (exifObj['Exif'] && exifObj['Exif'][piexif.ExifIFD.ExposureTime]) {
          const exposureTime = exifObj['Exif'][piexif.ExifIFD.ExposureTime];
          if (Array.isArray(exposureTime) && exposureTime.length === 2) {
            exifData.shutterSpeed = this.formatShutterSpeed(exposureTime[0] / exposureTime[1]);
          }
        }

        // ISO
        if (exifObj['Exif'] && exifObj['Exif'][piexif.ExifIFD.ISOSpeedRatings]) {
          exifData.iso = exifObj['Exif'][piexif.ExifIFD.ISOSpeedRatings];
        }

        // 焦距
        if (exifObj['Exif'] && exifObj['Exif'][piexif.ExifIFD.FocalLength]) {
          const focalLength = exifObj['Exif'][piexif.ExifIFD.FocalLength];
          if (Array.isArray(focalLength) && focalLength.length === 2) {
            exifData.focalLength = Math.round(focalLength[0] / focalLength[1]);
          }
        }

        // 图片尺寸
        if (this.imageNaturalWidth && this.imageNaturalHeight) {
          exifData.dimensions = `${this.imageNaturalWidth} × ${this.imageNaturalHeight}`;
        }
      } catch (error) {
        console.error('解析piexif数据失败:', error);
      }

      return exifData;
    },

    // 创建基本EXIF数据（当无法读取EXIF时）
    createBasicExifData() {
      const exifData = {};

      // 至少显示图片尺寸
      if (this.imageNaturalWidth && this.imageNaturalHeight) {
        exifData.dimensions = `${this.imageNaturalWidth} × ${this.imageNaturalHeight}`;
      }

      // 从文件名尝试获取一些信息
      if (this.currentImage && this.currentImage.title) {
        // 可以在这里添加从文件名解析信息的逻辑
      }

      this.currentExifData = exifData;
      if (this.currentImage) {
        this.exifCache.set(this.currentImage.src, exifData);
      }
    },

    retryLoad() {
      if (this.currentImage) {
        // 清除缓存中的失败项
        this.imageCache.delete(this.currentImage.src);
        this.exifCache.delete(this.currentImage.src);
      }
      this.loadCurrentImage();
    },
    
    previousImage() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      } else {
        this.currentIndex = this.images.length - 1;
      }
      this.showUITemporarily();
    },
    
    nextImage() {
      if (this.currentIndex < this.images.length - 1) {
        this.currentIndex++;
      } else {
        this.currentIndex = 0;
      }
      this.showUITemporarily();
    },
    
    goToImage(index) {
      this.currentIndex = index;
      this.showUITemporarily();
    },
    
    toggleUI() {
      this.showUI = !this.showUI;
      if (this.showUI) {
        this.startUITimeout();
      } else {
        this.clearUITimeout();
      }
    },
    
    showUITemporarily() {
      this.showUI = true;
      this.startUITimeout();
    },
    
    startUITimeout() {
      this.clearUITimeout();
      this.uiTimeout = setTimeout(() => {
        this.showUI = false;
      }, 3000);
    },
    
    clearUITimeout() {
      if (this.uiTimeout) {
        clearTimeout(this.uiTimeout);
        this.uiTimeout = null;
      }
    },
    
    clearLoadTimeout() {
      if (this.loadTimeout) {
        clearTimeout(this.loadTimeout);
        this.loadTimeout = null;
      }
    },
    
    handleKeydown(event) {
      switch (event.key) {
        case 'ArrowLeft':
          this.previousImage();
          break;
        case 'ArrowRight':
          this.nextImage();
          break;
        case 'Escape':
          this.closeViewer();
          break;
      }
    },
    
    downloadImage() {
      if (!this.currentImage) return;
      
      const link = document.createElement('a');
      link.href = this.currentImage.src;
      link.download = this.currentImage.title || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    
    // 格式化日期时间
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return '';

      try {
        // EXIF日期格式通常是 "YYYY:MM:DD HH:MM:SS"
        const cleanStr = dateTimeStr.replace(/:/g, '-', 2).replace(/:/g, ':');
        const date = new Date(cleanStr);

        if (isNaN(date.getTime())) {
          return dateTimeStr; // 如果解析失败，返回原始字符串
        }

        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      } catch (error) {
        return dateTimeStr;
      }
    },

    // 格式化快门速度
    formatShutterSpeed(speed) {
      if (!speed) return '';

      if (speed >= 1) {
        return speed.toString();
      } else {
        // 转换为分数形式
        const denominator = Math.round(1 / speed);
        return `1/${denominator}`;
      }
    },

    // 切换EXIF面板显示
    toggleExifPanel() {
      this.showExifPanel = !this.showExifPanel;
      if (this.showExifPanel) {
        this.showUITemporarily();
      }
    },

    // 更新窗口尺寸
    updateWindowSize() {
      this.windowHeight = window.innerHeight;
      this.windowWidth = window.innerWidth;
    },

    // 处理窗口大小变化
    handleResize() {
      this.updateWindowSize();
    },

    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
};
</script>

<style scoped>
/* 缩略图导航 */
.thumbnail-nav-item {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 6px;
  transition: border-color 0.2s ease;
}

.thumbnail-nav-item:hover {
  border-color: rgba(255,255,255,0.5);
}

.thumbnail-nav-item.active {
  border-color: white;
}

/* 底部信息栏 */
.image-info-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
  padding: 40px 20px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.image-info-content {
  flex: 1;
}

.image-info-actions {
  display: flex;
  gap: 8px;
}

.exif-button {
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.exif-button:hover {
  opacity: 1;
}

/* EXIF信息面板 */
.exif-panel {
  position: absolute;
  top: 60px;
  right: 20px;
  width: 300px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  color: white;
  padding: 16px;
  z-index: 1100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.exif-panel-visible {
  transform: translateX(0);
  opacity: 1;
}

.exif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 8px;
}

.exif-header h4 {
  margin: 0;
  font-weight: 500;
}

/* 动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>