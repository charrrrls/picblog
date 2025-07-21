/**
 * GitHub API服务 - 用于获取图片仓库数据
 */

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'charrrrls';
const REPO_NAME = 'mypic';

class GitHubApiService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
    }

    /**
     * 获取仓库内容
     * @param {string} path - 路径，默认为根目录
     * @returns {Promise<Array>} 文件和目录列表
     */
    async getRepoContents(path = '') {
        const cacheKey = `contents_${path}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 缓存结果
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('获取GitHub仓库内容失败:', error);
            throw error;
        }
    }

    /**
     * 获取所有项目文件夹
     * @returns {Promise<Array>} 项目文件夹列表
     */
    async getProjectFolders() {
        try {
            const contents = await this.getRepoContents();
            
            // 过滤出文件夹
            const folders = contents.filter(item => item.type === 'dir');
            
            return folders.map(folder => ({
                name: folder.name,
                path: folder.path,
                url: folder.html_url
            }));
        } catch (error) {
            console.error('获取项目文件夹失败:', error);
            return [];
        }
    }

    /**
     * 获取项目中的图片文件
     * @param {string} projectPath - 项目路径
     * @returns {Promise<Array>} 图片文件列表
     */
    async getProjectImages(projectPath) {
        try {
            const contents = await this.getRepoContents(projectPath);
            
            // 支持的图片格式
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
            
            // 过滤出图片文件
            const images = contents.filter(item => {
                if (item.type !== 'file') return false;
                
                const extension = item.name.toLowerCase().substr(item.name.lastIndexOf('.'));
                return imageExtensions.includes(extension);
            });
            
            return images.map(image => ({
                name: image.name,
                path: image.path,
                downloadUrl: image.download_url,
                size: image.size,
                sha: image.sha
            }));
        } catch (error) {
            console.error(`获取项目 ${projectPath} 图片失败:`, error);
            return [];
        }
    }

    /**
     * 生成缩略图URL
     * @param {string} originalUrl - 原图URL
     * @param {number} width - 缩略图宽度
     * @param {number} height - 缩略图高度
     * @returns {string} 缩略图URL
     */
    generateThumbnailUrl(originalUrl, width = 300, height = 200) {
        // 使用GitHub的Camo服务或者第三方图片处理服务生成缩略图
        // 这里先使用简单的参数传递，实际可以集成更专业的图片处理服务
        return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}&w=${width}&h=${height}&fit=cover&we`;
    }

    /**
     * 获取项目的封面图片
     * @param {string} projectPath - 项目路径
     * @returns {Promise<string|null>} 封面图片URL
     */
    async getProjectCoverImage(projectPath) {
        try {
            const images = await this.getProjectImages(projectPath);
            
            if (images.length === 0) return null;
            
            // 选择第一张图片作为封面，或者可以寻找特定命名的封面图片
            const coverImage = images.find(img => 
                img.name.toLowerCase().includes('cover') || 
                img.name.toLowerCase().includes('封面')
            ) || images[0];
            
            return this.generateThumbnailUrl(coverImage.downloadUrl, 400, 300);
        } catch (error) {
            console.error(`获取项目 ${projectPath} 封面失败:`, error);
            return null;
        }
    }

    /**
     * 获取完整的项目数据（包含图片）
     * @returns {Promise<Array>} 项目数据列表
     */
    async getProjectsWithImages() {
        try {
            const folders = await this.getProjectFolders();
            
            const projectsData = await Promise.all(
                folders.map(async (folder) => {
                    const coverImage = await this.getProjectCoverImage(folder.path);
                    const images = await this.getProjectImages(folder.path);
                    
                    return {
                        id: folder.path,
                        name: folder.name,
                        title: folder.name,
                        subtitle: `${images.length} 张图片`,
                        text: `查看 ${folder.name} 项目的所有照片`,
                        img: coverImage || '/img/sunshine.jpg', // 默认封面
                        path: folder.path,
                        imageCount: images.length,
                        go: "📸 查看",
                        url: null, // 不跳转外部链接，内部处理
                        show: false
                    };
                })
            );
            
            return projectsData;
        } catch (error) {
            console.error('获取项目数据失败:', error);
            return [];
        }
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
    }
}

// 创建单例实例
const githubApiService = new GitHubApiService();

export default githubApiService;