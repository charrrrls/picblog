<template>
  <div 
    class="lazy-image-container"
    :style="{ 
      width: width + 'px', 
      height: height + 'px',
      backgroundColor: '#f5f5f5',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '8px'
    }"
    ref="imageContainer"
  >
    <!-- 加载占位符 -->
    <div 
      v-if="loading && !error" 
      class="loading-placeholder"
      :style="{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }"
    >
      <v-progress-circular 
        indeterminate 
        color="primary" 
        size="40"
      ></v-progress-circular>
      <p style="margin-top: 10px; color: #666; font-size: 12px;">加载中...</p>
    </div>

    <!-- 错误占位符 -->
    <div 
      v-if="error" 
      class="error-placeholder"
      :style="{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: '#999'
      }"
    >
      <v-icon size="40" color="grey">mdi-image-broken-variant</v-icon>
      <p style="margin-top: 8px; font-size: 12px;">图片加载失败</p>
      <v-btn 
        size="small" 
        variant="outlined" 
        @click="retryLoad"
        style="margin-top: 8px;"
      >
        重试
      </v-btn>
    </div>

    <!-- 实际图片 -->
    <transition name="fade">
      <img
        v-if="imageLoaded && !error"
        :src="currentSrc"
        :alt="alt"
        class="lazy-image"
        :style="{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          borderRadius: '8px'
        }"
        @click="handleImageClick"
      />
    </transition>

    <!-- 图片信息悬浮层 -->
    <transition name="fade">
      <div 
        v-if="showOverlay && imageLoaded && !error"
        class="image-overlay"
        :style="{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          color: 'white',
          padding: '16px 12px 12px',
          fontSize: '14px'
        }"
      >
        <div style="font-weight: 500;">{{ imageTitle }}</div>
        <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">
          {{ formatFileSize(imageSize) }}
        </div>
      </div>
    </transition>

    <!-- 放大镜图标 -->
    <transition name="fade">
      <div 
        v-if="showZoomIcon && imageLoaded && !error"
        class="zoom-icon"
        :style="{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }"
        @click="handleImageClick"
      >
        <v-icon color="white" size="24">mdi-magnify-plus</v-icon>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'LazyImage',
  props: {
    src: {
      type: String,
      required: true
    },
    thumbnailSrc: {
      type: String,
      default: null
    },
    alt: {
      type: String,
      default: ''
    },
    width: {
      type: Number,
      default: 300
    },
    height: {
      type: Number,
      default: 200
    },
    imageTitle: {
      type: String,
      default: ''
    },
    imageSize: {
      type: Number,
      default: 0
    },
    clickable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: true,
      error: false,
      imageLoaded: false,
      showOverlay: false,
      showZoomIcon: false,
      currentSrc: '',
      observer: null
    };
  },
  mounted() {
    this.setupIntersectionObserver();
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    setupIntersectionObserver() {
      // 创建 Intersection Observer 实现懒加载
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadImage();
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px' // 提前50px开始加载
        }
      );

      this.observer.observe(this.$refs.imageContainer);
    },
    
    async loadImage() {
      this.loading = true;
      this.error = false;
      
      try {
        // 先加载缩略图（如果有）
        const imageToLoad = this.thumbnailSrc || this.src;
        await this.preloadImage(imageToLoad);
        
        this.currentSrc = imageToLoad;
        this.imageLoaded = true;
        this.loading = false;
        
        // 如果当前显示的是缩略图，在后台预加载原图
        if (this.thumbnailSrc && this.thumbnailSrc !== this.src) {
          this.preloadOriginalImage();
        }
        
      } catch (error) {
        console.error('图片加载失败:', error);
        this.error = true;
        this.loading = false;
      }
    },
    
    preloadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    },
    
    async preloadOriginalImage() {
      try {
        await this.preloadImage(this.src);
        // 原图加载完成，可以在用户点击时快速切换
      } catch (error) {
        console.error('原图预加载失败:', error);
      }
    },
    
    retryLoad() {
      this.loadImage();
    },
    
    handleImageClick() {
      if (this.clickable) {
        this.$emit('click', {
          src: this.src,
          thumbnailSrc: this.thumbnailSrc,
          alt: this.alt,
          title: this.imageTitle,
          size: this.imageSize
        });
      }
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    showImageInfo() {
      this.showOverlay = true;
      this.showZoomIcon = true;
    },
    
    hideImageInfo() {
      this.showOverlay = false;
      this.showZoomIcon = false;
    }
  }
};
</script>

<style scoped>
.lazy-image-container {
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.lazy-image-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.lazy-image-container:hover .image-overlay,
.lazy-image-container:hover .zoom-icon {
  opacity: 1;
}

.image-overlay,
.zoom-icon {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>