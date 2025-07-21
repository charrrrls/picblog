<template>
  <div 
    class="enhanced-lazy-image"
    :class="[layoutMode, { 'loading': loading, 'error': error }]"
    :style="containerStyle"
    ref="imageContainer"
  >
    <!-- 加载占位符 -->
    <div v-if="loading && !error" class="loading-placeholder">
      <v-progress-circular 
        indeterminate 
        color="primary" 
        size="24"
      ></v-progress-circular>
    </div>

    <!-- 错误占位符 -->
    <div v-if="error" class="error-placeholder">
      <v-icon size="32" color="grey">mdi-image-broken-variant</v-icon>
      <v-btn 
        size="x-small" 
        variant="text" 
        @click="retryLoad"
        style="margin-top: 4px;"
      >
        重试
      </v-btn>
    </div>

    <!-- 实际图片容器 -->
    <div v-if="!loading && !error" class="image-wrapper">
      <div class="image-frame">
        <img
          :src="currentSrc"
          :alt="alt"
          class="gallery-image"
          :style="imageStyle"
          @click="handleImageClick"
          @load="onImageLoad"
          @error="onImageError"
        />
        
        <!-- 光影边框层 -->
        <div class="border-overlay"></div>
        
        <!-- 悬停效果层 -->
        <div class="hover-overlay">
          <div class="hover-content">
            <v-icon color="white" size="32">mdi-magnify-plus</v-icon>
            <div class="image-info">
              <div class="image-title">{{ imageTitle }}</div>
              <div class="image-size">{{ formatFileSize(imageSize) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EnhancedLazyImage',
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
    imageTitle: {
      type: String,
      default: ''
    },
    imageSize: {
      type: Number,
      default: 0
    },
    layoutMode: {
      type: String,
      default: 'grid', // 'grid' | 'masonry'
      validator: value => ['grid', 'masonry'].includes(value)
    },
    columnWidth: {
      type: Number,
      default: 300
    },
    gapSize: {
      type: Number,
      default: 20
    }
  },
  data() {
    return {
      loading: true,
      error: false,
      currentSrc: '',
      observer: null,
      naturalWidth: 0,
      naturalHeight: 0,
      aspectRatio: 1
    };
  },
  computed: {
    containerStyle() {
      if (this.layoutMode === 'grid') {
        return {
          width: `${this.columnWidth}px`,
          marginBottom: `${this.gapSize}px`
        };
      } else {
        // 瀑布流模式：计算实际高度保持比例
        const height = this.aspectRatio > 0 ? (this.columnWidth / this.aspectRatio) : 200;
        return {
          width: `${this.columnWidth}px`,
          height: `${height + 32}px`, // 32px for padding and border
          marginBottom: `${this.gapSize}px`,
          breakInside: 'avoid'
        };
      }
    },
    
    imageStyle() {
      if (this.layoutMode === 'grid') {
        return {
          width: '100%',
          height: '200px',
          objectFit: 'cover'
        };
      } else {
        // 瀑布流模式：保持原始比例
        return {
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          maxHeight: '400px' // 限制最大高度
        };
      }
    }
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
          rootMargin: '100px' // 提前100px开始加载
        }
      );

      this.observer.observe(this.$refs.imageContainer);
    },
    
    async loadImage() {
      this.loading = true;
      this.error = false;
      
      try {
        // 先获取图片尺寸信息
        const { width, height } = await this.getImageDimensions(this.thumbnailSrc || this.src);
        this.naturalWidth = width;
        this.naturalHeight = height;
        this.aspectRatio = width / height;
        
        // 加载缩略图
        const imageToLoad = this.thumbnailSrc || this.src;
        await this.preloadImage(imageToLoad);
        
        this.currentSrc = imageToLoad;
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
    
    getImageDimensions(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
          resolve({
            width: this.naturalWidth,
            height: this.naturalHeight
          });
        };
        img.onerror = reject;
        img.src = src;
      });
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
      } catch (error) {
        console.error('原图预加载失败:', error);
      }
    },
    
    retryLoad() {
      this.loadImage();
    },
    
    onImageLoad() {
      // 图片加载成功后的处理
    },
    
    onImageError() {
      this.error = true;
      this.loading = false;
    },
    
    handleImageClick() {
      this.$emit('click', {
        src: this.src,
        thumbnailSrc: this.thumbnailSrc,
        alt: this.alt,
        title: this.imageTitle,
        size: this.imageSize,
        aspectRatio: this.aspectRatio,
        naturalWidth: this.naturalWidth,
        naturalHeight: this.naturalHeight
      });
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
.enhanced-lazy-image {
  position: relative;
  border-radius: 12px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.enhanced-lazy-image.grid {
  /* Grid 模式样式 */
}

.enhanced-lazy-image.masonry {
  /* 瀑布流模式样式 */
  break-inside: avoid;
  page-break-inside: avoid;
}

.loading-placeholder,
.error-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f5f5f5;
  border-radius: 12px;
  color: #666;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

.image-frame {
  position: relative;
  background: #ffffff;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
}

.gallery-image {
  width: 100%;
  border-radius: 8px;
  display: block;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.border-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  bottom: 12px;
  border-radius: 8px;
  background: linear-gradient(45deg, 
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(0, 0, 0, 0.02) 100%
  );
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hover-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  bottom: 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
}

.hover-content {
  text-align: center;
  color: white;
  transform: translateY(10px);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.image-info {
  margin-top: 8px;
}

.image-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.image-size {
  font-size: 12px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 悬停效果 */
.enhanced-lazy-image:hover {
  transform: translateY(-4px);
}

.enhanced-lazy-image:hover .image-frame {
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

.enhanced-lazy-image:hover .gallery-image {
  transform: scale(1.02);
}

.enhanced-lazy-image:hover .border-overlay {
  opacity: 1;
}

.enhanced-lazy-image:hover .hover-overlay {
  opacity: 1;
}

.enhanced-lazy-image:hover .hover-content {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-frame {
    padding: 8px;
  }
  
  .hover-overlay {
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 8px;
  }
  
  .border-overlay {
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 8px;
  }
  
  .enhanced-lazy-image:hover {
    transform: translateY(-2px);
  }
}

/* 加载动画 */
@keyframes shimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}

.loading-placeholder {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 400% 100%;
  animation: shimmer 1.5s infinite;
}
</style>