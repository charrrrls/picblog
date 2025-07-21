<template>
  <div class="project-gallery-premium">
    <!-- 项目标题和信息 - 透明风格 -->
    <div class="gallery-header">
      <v-btn 
        icon="mdi-arrow-left" 
        @click="goBack"
        class="premium-back-btn"
        variant="text"
        size="large"
      ></v-btn>
      
      <div class="header-content">
        <h1 class="gallery-title">{{ projectName }}</h1>
        <div class="gallery-meta">
          <span class="meta-item">{{ images.length }} 张照片</span>
          <span v-if="totalSize > 0" class="meta-item">{{ formatFileSize(totalSize) }}</span>
          <span class="meta-item">{{ formattedDate }}</span>
        </div>
      </div>
    </div>

    <!-- 加载状态 - 优化设计 -->
    <div v-if="loading" class="premium-loading">
      <div class="loading-grid">
        <div v-for="n in 6" :key="n" class="loading-card">
          <div class="loading-image"></div>
          <div class="loading-info">
            <div class="loading-title"></div>
            <div class="loading-subtitle"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误状态 - 优化设计 -->
    <div v-else-if="error" class="premium-error">
      <div class="error-content">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3>加载失败</h3>
        <p>无法加载项目图片，请检查网络连接</p>
        <v-btn 
          @click="loadImages"
          variant="outlined"
          color="primary"
          class="retry-btn"
        >
          重新加载
        </v-btn>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div v-else-if="images.length > 0" class="gallery-content">
      <!-- 使用纯瀑布流组件 -->
      <PureMasonryContainer 
        :images="images"
        @back="goBack"
      />
    </div>

    <!-- 空状态 - 优化设计 -->
    <div v-else class="premium-empty">
      <div class="empty-content">
        <div class="empty-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        </div>
        <h3>暂无图片</h3>
        <p>该项目文件夹中没有找到任何图片文件</p>
      </div>
    </div>

    <!-- 图片查看器 -->
    <ImageViewer
      :visible="viewerVisible"
      @update:visible="viewerVisible = $event"
      :images="viewerImages"
      :initial-index="viewerIndex"
    />
  </div>
</template>

<script>
import PureMasonryContainer from './PureMasonryContainer.vue';
import ImageViewer from './ImageViewer.vue';
import githubApiService from '../services/githubApi.js';

export default {
  name: 'ProjectGallery',
  components: {
    PureMasonryContainer,
    ImageViewer
  },
  props: {
    projectPath: {
      type: String,
      required: true
    },
    projectName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      loading: true,
      error: false,
      images: [],
      viewerVisible: false,
      viewerIndex: 0
    };
  },
  computed: {
    viewerImages() {
      return this.images.map(image => ({
        src: image.downloadUrl,
        thumbnailSrc: this.getThumbnailUrl(image.downloadUrl),
        alt: image.name,
        title: this.getImageTitle(image.name),
        size: image.size
      }));
    },
    
    totalSize() {
      return this.images.reduce((total, image) => total + (image.size || 0), 0);
    },
    
    formattedDate() {
      return new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  mounted() {
    this.loadImages();
  },
  
  beforeUnmount() {
    // 清理工作
  },
  
  methods: {
    async loadImages() {
      this.loading = true;
      this.error = false;
      
      try {
        const images = await githubApiService.getProjectImages(this.projectPath);
        this.images = images;
        
      } catch (error) {
        console.error('加载项目图片失败:', error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
    
    getThumbnailUrl(originalUrl) {
      return githubApiService.generateThumbnailUrl(originalUrl, 400, 300);
    },
    
    getImageTitle(filename) {
      return filename.replace(/\.[^/.]+$/, '');
    },
    
    openImageViewer(index) {
      this.viewerIndex = index;
      this.viewerVisible = true;
    },
    
    goBack() {
      this.$emit('back');
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
};
</script>

<style scoped>
/* 主容器 - 透明背景设计 */
.project-gallery-premium {
  min-height: 100vh;
  background: transparent;
  padding: 40px 20px 80px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* 标题区域 - 简约透明设计 */
.gallery-header {
  display: flex;
  align-items: center;
  margin-bottom: 48px;
  padding: 0;
  background: transparent;
}

.premium-back-btn {
  margin-right: 24px;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-back-btn:hover {
  background: rgba(255, 255, 255, 1) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.header-content {
  flex: 1;
}

.gallery-title {
  font-size: 42px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
}

.gallery-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 8px;
}

.meta-item {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.2);
}

/* 主要内容区域 */
.gallery-content {
  background: transparent;
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 加载状态 - 高端设计 */
.premium-loading {
  padding: 40px 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.loading-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loading-image {
  width: 100%;
  aspect-ratio: 4/3;
  background: linear-gradient(
    90deg,
    rgba(240, 240, 240, 0.8) 25%,
    rgba(220, 220, 220, 0.9) 50%,
    rgba(240, 240, 240, 0.8) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.loading-info {
  padding: 24px;
}

.loading-title {
  height: 20px;
  background: linear-gradient(
    90deg,
    rgba(240, 240, 240, 0.8) 25%,
    rgba(220, 220, 220, 0.9) 50%,
    rgba(240, 240, 240, 0.8) 75%
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
    rgba(240, 240, 240, 0.8) 25%,
    rgba(220, 220, 220, 0.9) 50%,
    rgba(240, 240, 240, 0.8) 75%
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

/* 错误和空状态 */
.premium-error,
.premium-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px 20px;
}

.error-content,
.empty-content {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px);
  border-radius: 20px;
  padding: 48px 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 50px rgba(0, 0, 0, 0.08);
}

.error-icon,
.empty-icon {
  color: #666;
  margin-bottom: 24px;
}

.error-content h3,
.empty-content h3 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.error-content p,
.empty-content p {
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.retry-btn {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-top: 24px;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-gallery-premium {
    padding: 20px 10px 60px;
  }
  
  .gallery-header {
    margin-bottom: 32px;
  }
  
  .gallery-title {
    font-size: 32px;
  }
  
  .gallery-meta {
    gap: 16px;
  }
  
  .meta-item {
    font-size: 14px;
  }
  
  .loading-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .gallery-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .premium-back-btn {
    margin-right: 0;
    align-self: flex-start;
  }
  
  .gallery-title {
    font-size: 28px;
  }
  
  .error-content,
  .empty-content {
    padding: 32px 24px;
  }
}
</style>