<template>
  <div class="optimized-card" :class="{ 'loading': loading }" ref="cardContainer">
    <!-- 加载状态 -->
    <div v-if="loading" class="card-loading">
      <div class="loading-shimmer"></div>
    </div>

    <!-- 卡片内容 -->
    <div v-else class="photo-card" @click="handleClick">
      <!-- 图片容器 - 自适应高度 -->
      <div class="image-container" :style="imageContainerStyle">
        <img
          :src="thumbnailSrc || imageSrc"
          :alt="imageTitle"
          class="photo-image"
          loading="lazy"
          @load="onImageLoad"
          @error="onImageError"
          ref="imageElement"
        />
        
        <!-- 悬停遮罩 -->
        <div class="hover-overlay">
          <div class="overlay-content">
            <div class="view-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <span class="overlay-text">查看</span>
          </div>
        </div>

        <!-- 图片信息标识 -->
        <div v-if="imageCount > 1" class="image-count-badge">
          {{ imageCount }}
        </div>

        <!-- 图片标题叠加 -->
        <div class="image-title-overlay">
          <h4 class="image-title">{{ imageTitle }}</h4>
          <time class="image-date">{{ formattedDate }}</time>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OptimizedPhotoCard',
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
      observer: null,
      imageAspectRatio: null
    };
  },
  computed: {
    formattedDate() {
      if (!this.dateCreated) {
        return new Date().toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric'
        });
      }
      
      const date = new Date(this.dateCreated);
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    },
    
    imageContainerStyle() {
      // 动态设置容器高度以匹配图片比例
      if (this.imageAspectRatio) {
        return {
          aspectRatio: this.imageAspectRatio
        };
      }
      return {};
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
              // 延迟加载以优化性能
              setTimeout(() => {
                this.loading = false;
              }, Math.random() * 300 + 100);
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '100px'
        }
      );

      this.observer.observe(this.$refs.cardContainer);
    },
    
    onImageLoad() {
      this.imageLoaded = true;
      
      // 获取图片真实尺寸以计算比例
      if (this.$refs.imageElement) {
        const img = this.$refs.imageElement;
        this.imageAspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
      }
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
.optimized-card {
  position: relative;
  width: 100%;
  /* 移除margin-bottom，由父容器的gap控制间距 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  /* 确保在瀑布流中正确显示 */
  break-inside: avoid;
  page-break-inside: avoid;
  -webkit-column-break-inside: avoid;
}

.photo-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.photo-card:hover {
  transform: translateY(-6px);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.08),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 图片容器 - 瀑布流优化 */
.image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  /* 让容器高度自适应图片内容 */
  line-height: 0; /* 移除行高影响 */
}

.photo-image {
  width: 100%;
  height: auto; /* 关键：保持图片原始比例 */
  display: block; /* 关键：移除底部空白 */
  object-fit: cover; /* 适当裁剪以保持美观 */
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  /* 确保图片在瀑布流中正确显示 */
  max-width: 100%;
  vertical-align: top;
}

.photo-card:hover .photo-image {
  transform: scale(1.05);
}

/* 悬停遮罩 */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.2) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  backdrop-filter: blur(4px);
}

.photo-card:hover .hover-overlay {
  opacity: 1;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  transform: translateY(15px);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.photo-card:hover .overlay-content {
  transform: translateY(0);
}

.view-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 8px;
}

.overlay-text {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin: 0;
}

/* 图片数量标识 */
.image-count-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 图片标题叠加 */
.image-title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 60%,
    transparent 100%
  );
  padding: 16px 12px 12px;
  color: white;
  backdrop-filter: blur(8px);
}

.image-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  line-height: 1.3;
  letter-spacing: -0.01em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.image-date {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* 加载状态 */
.card-loading {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading-shimmer {
  width: 100%;
  height: 200px; /* 适中的加载高度 */
  background: linear-gradient(
    90deg,
    rgba(240, 240, 240, 0.8) 25%,
    rgba(220, 220, 220, 0.9) 50%,
    rgba(240, 240, 240, 0.8) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .optimized-card {
    margin-bottom: 16px;
  }
  
  .photo-card:hover {
    transform: translateY(-3px);
  }
  
  .view-icon {
    width: 36px;
    height: 36px;
  }
  
  .image-title-overlay {
    padding: 12px 10px 8px;
  }
  
  .image-title {
    font-size: 13px;
  }
  
  .image-date {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .photo-card {
    border-radius: 8px;
  }

  .image-container {
    border-radius: 8px;
  }

  .image-title-overlay {
    padding: 10px 8px 6px;
  }

  .image-title {
    font-size: 12px;
  }
}
</style>