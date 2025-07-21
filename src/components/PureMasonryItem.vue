<template>
  <div class="pure-masonry-item" ref="itemContainer">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-placeholder"></div>
    
    <!-- 纯净图片 -->
    <div v-else class="image-wrapper" @click="handleClick">
      <img
        :src="thumbnailSrc || imageSrc"
        :alt="imageTitle"
        class="masonry-image"
        loading="lazy"
        @load="onImageLoad"
        @error="onImageError"
        ref="imageElement"
      />
      
      <!-- 简洁的悬停效果 -->
      <div class="hover-overlay">
        <div class="zoom-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="21 21l-4.35-4.35"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PureMasonryItem',
  props: {
    imageSrc: {
      type: String,
      required: true
    },
    thumbnailSrc: {
      type: String,
      default: null
    },
    imageTitle: {
      type: String,
      required: true
    },
    imageCount: {
      type: Number,
      default: 1
    },
    fileSize: {
      type: Number,
      default: 0
    },
    dateCreated: {
      type: [String, Date],
      default: null
    }
  },
  data() {
    return {
      loading: true,
      imageLoaded: false,
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
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // 快速加载
              setTimeout(() => {
                this.loading = false;
              }, Math.random() * 200 + 50);
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '100px'
        }
      );

      this.observer.observe(this.$refs.itemContainer);
    },
    
    onImageLoad() {
      this.imageLoaded = true;
      // 通知父组件重新计算布局
      this.$emit('image-loaded');
    },
    
    onImageError() {
      console.error('图片加载失败:', this.imageSrc);
    },
    
    handleClick() {
      this.$emit('click', {
        title: this.imageTitle,
        src: this.imageSrc,
        thumbnailSrc: this.thumbnailSrc,
        count: this.imageCount,
        size: this.fileSize,
        date: this.dateCreated
      });
    }
  }
};
</script>

<style scoped>
.pure-masonry-item {
  /* 关键：确保项目在瀑布流中正确显示 */
  break-inside: avoid;
  page-break-inside: avoid;
  -webkit-column-break-inside: avoid;
  margin-bottom: 16px; /* 统一间距 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.image-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.image-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.06);
}

.masonry-image {
  width: 100%;
  height: auto; /* 关键：保持原始比例 */
  display: block; /* 关键：移除底部空白 */
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  /* 确保图片质量 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.image-wrapper:hover .masonry-image {
  transform: scale(1.02);
}

/* 简洁的悬停效果 */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .hover-overlay {
  opacity: 1;
}

.zoom-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  color: #333;
  transform: scale(0.8);
  transition: transform 0.3s ease;
}

.image-wrapper:hover .zoom-icon {
  transform: scale(1);
}

/* 加载状态 */
.loading-placeholder {
  width: 100%;
  height: 200px; /* 默认加载高度 */
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .pure-masonry-item {
    margin-bottom: 12px;
  }
  
  .image-wrapper:hover {
    transform: translateY(-1px);
  }
  
  .zoom-icon {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .pure-masonry-item {
    margin-bottom: 8px;
  }
  
  .image-wrapper {
    border-radius: 6px;
  }
  
  .loading-placeholder {
    border-radius: 6px;
  }
}
</style>