<template>
  <div class="pure-masonry-container">
    <!-- 工具栏 - 简化版 -->
    <div class="masonry-toolbar">
      <div class="toolbar-left">
        <span class="image-count">{{ images.length }} 张图片</span>
      </div>
      <div class="toolbar-right">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          item-title="text"
          item-value="value"
          density="compact"
          variant="outlined"
          hide-details
          style="width: 120px;"
        ></v-select>
      </div>
    </div>

    <!-- 瀑布流容器 -->
    <div 
      ref="masonryContainer"
      class="masonry-grid"
    >
      <PureMasonryItem
        v-for="(image, index) in sortedImages"
        :key="image.path"
        :image-src="image.downloadUrl"
        :thumbnail-src="getThumbnailUrl(image.downloadUrl)"
        :image-title="getImageTitle(image.name)"
        :image-count="1"
        :file-size="image.size"
        :date-created="image.lastModified || new Date()"
        @click="openImageViewer(index)"
        @image-loaded="handleImageLoaded"
      />
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
import PureMasonryItem from './PureMasonryItem.vue';
import ImageViewer from './ImageViewer.vue';

export default {
  name: 'PureMasonryContainer',
  components: {
    PureMasonryItem,
    ImageViewer
  },
  props: {
    images: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      sortBy: 'name',
      sortOptions: [
        { text: '按名称', value: 'name' },
        { text: '按大小', value: 'size' },
        { text: '按日期', value: 'date' }
      ],
      viewerVisible: false,
      viewerIndex: 0,
      columnCount: 3  // 固定为3列
    };
  },
  computed: {
    sortedImages() {
      const images = [...this.images];
      
      switch (this.sortBy) {
        case 'size':
          return images.sort((a, b) => b.size - a.size);
        case 'date':
          return images.sort((a, b) => new Date(b.lastModified || 0) - new Date(a.lastModified || 0));
        default: // name
          return images.sort((a, b) => a.name.localeCompare(b.name));
      }
    },
    
    viewerImages() {
      return this.sortedImages.map(image => ({
        src: image.downloadUrl,
        thumbnailSrc: this.getThumbnailUrl(image.downloadUrl),
        alt: image.name,
        title: this.getImageTitle(image.name),
        size: image.size
      }));
    }
  },
  mounted() {
    // 固定三列，不需要计算
  },
  
  beforeUnmount() {
    // 清理工作
  },
  
  methods: {
    handleImageLoaded() {
      // 图片加载完成，无需重新计算列数（固定三列）
    },
    
    getThumbnailUrl(originalUrl) {
      // 使用图片服务生成缩略图
      return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}&w=400&h=600&fit=inside&we`;
    },
    
    getImageTitle(filename) {
      return filename.replace(/\.[^/.]+$/, '');
    },
    
    openImageViewer(index) {
      this.viewerIndex = index;
      this.viewerVisible = true;
    }
  }
};
</script>

<style scoped>
.pure-masonry-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

/* 简化工具栏 */
.masonry-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.5); /* 降低透明度 */
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.image-count {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

/* 瀑布流网格 - 固定三列 */
.masonry-grid {
  column-count: 3;
  column-gap: 16px;
  column-fill: balance;
  /* 优化性能 */
  will-change: auto;
  /* 防止图片被截断 */
  orphans: 1;
  widows: 1;
}

/* 响应式设计 - 保持三列 */
@media (max-width: 768px) {
  .pure-masonry-container {
    padding: 16px;
  }
  
  .masonry-toolbar {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
    margin-bottom: 20px;
  }
  
  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }
  
  .masonry-grid {
    column-gap: 12px;
    /* 保持三列 */
    column-count: 3 !important;
  }
}

@media (max-width: 480px) {
  .pure-masonry-container {
    padding: 12px;
  }
  
  .masonry-toolbar {
    margin-bottom: 16px;
  }
  
  .masonry-grid {
    column-gap: 8px;
    /* 保持三列 */
    column-count: 3 !important;
  }
}

/* 宽屏优化 */
@media (min-width: 1600px) {
  .masonry-grid {
    column-gap: 20px;
  }
}

/* 瀑布流动画效果 */
.masonry-grid {
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
