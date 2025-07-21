<template>
  <div class="premium-card-container" :class="{ 'loading': loading }" ref="cardContainer">
    <!-- 加载状态 -->
    <div v-if="loading" class="card-loading">
      <div class="loading-shimmer"></div>
      <div class="loading-content">
        <div class="loading-title"></div>
        <div class="loading-subtitle"></div>
      </div>
    </div>

    <!-- 卡片内容 -->
    <div v-else class="premium-card" @click="handleClick">
      <!-- 图片容器 -->
      <div class="card-image-wrapper">
        <img
          :src="thumbnailSrc || imageSrc"
          :alt="imageTitle"
          class="card-image"
          loading="lazy"
          @load="onImageLoad"
          @error="onImageError"
        />
        
        <!-- 悬停遮罩 -->
        <div class="hover-overlay">
          <div class="overlay-content">
            <div class="view-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <p class="overlay-text">查看所有照片</p>
          </div>
        </div>

        <!-- 图片数量标识 -->
        <div v-if="imageCount > 0" class="image-count-badge">
          <span>{{ imageCount }} 张</span>
        </div>
      </div>

      <!-- 卡片信息 -->
      <div class="card-info">
        <h3 class="card-title">{{ imageTitle }}</h3>
        <div class="card-meta">
          <time class="card-date">{{ formattedDate }}</time>
          <span v-if="fileSize" class="card-size">{{ formatFileSize(fileSize) }}</span>
        </div>
        <p class="card-description">点击查看所有照片</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PremiumPhotoCard',
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
      default: 0
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
  computed: {
    formattedDate() {
      if (!this.dateCreated) {
        return new Date().toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      const date = new Date(this.dateCreated);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
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
              setTimeout(() => {
                this.loading = false;
              }, Math.random() * 500 + 200); // 模拟加载时间
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px'
        }
      );

      this.observer.observe(this.$refs.cardContainer);
    },
    
    onImageLoad() {
      this.imageLoaded = true;
    },
    
    onImageError() {
      // 图片加载失败处理
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
    },
    
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
  }
};
</script>

<style scoped>
.premium-card-container {
  position: relative;
  height: auto;
  break-inside: avoid;
  margin-bottom: 24px;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.premium-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.premium-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.08);
}

/* 图片容器 */
.card-image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
  aspect-ratio: 4/3;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.premium-card:hover .card-image {
  transform: scale(1.08);
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
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  backdrop-filter: blur(8px);
}

.premium-card:hover .hover-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
  color: white;
  transform: translateY(20px);
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.premium-card:hover .overlay-content {
  transform: translateY(0);
}

.view-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.overlay-text {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.5px;
}

/* 图片数量标识 */
.image-count-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 卡片信息 */
.card-info {
  padding: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
  line-height: 1.4;
  letter-spacing: -0.02em;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.card-date {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.card-size {
  font-size: 13px;
  color: #888;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.card-description {
  font-size: 14px;
  color: #888;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.2px;
}

/* 加载状态 */
.card-loading {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading-shimmer {
  width: 100%;
  aspect-ratio: 4/3;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.loading-content {
  padding: 24px;
}

.loading-title {
  height: 20px;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
  margin-bottom: 12px;
}

.loading-subtitle {
  height: 14px;
  width: 60%;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 4px;
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
  .premium-card-container {
    margin-bottom: 20px;
  }
  
  .card-info {
    padding: 20px;
  }
  
  .card-title {
    font-size: 16px;
  }
  
  .premium-card:hover {
    transform: translateY(-4px);
  }
  
  .view-icon {
    width: 40px;
    height: 40px;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .card-info {
    padding: 16px;
  }
  
  .card-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>