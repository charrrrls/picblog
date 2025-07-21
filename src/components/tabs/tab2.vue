<template>
    <v-container fluid class="pa-0 tab2">
      <v-tabs
          v-model="tab"
          :items="tabs"
          align-tabs="center"
          height="25"
          slider-color=var(--leleo-vcard-color)
        >
          <template v-slot:tab="{ item }">
            <v-tab
              :prepend-icon="item.icon"
              :text="item.text"
              :value="item.value"
              class="text-none"
            ></v-tab>
          </template>
          
          <template v-slot:item="{ item }">
            <v-tabs-window-item :value="item.value" class="pa-4">
                <div v-if="item.value === 'tab-1'">
                    <v-radio-group v-model="radios" inline>
                        <template v-slot:label>
                            <div class="mb-2 d-flex justify-space-between" style="width: 100%;align-items: center;">
                                <div class="itemText"><strong :style="smAndDown?{'font-size':'13px'}:{}">{{ radios.title }}</strong></div>
                                <div class="d-flex align-center ga-2">
                                    <v-btn variant="tonal" :density="smAndDown?'compact':'default'" @click="selectRandomWallpaper">
                                        <v-icon>mdi-shuffle-variant</v-icon>
                                    </v-btn>
                                    <v-menu location="bottom" :offset="[0, 15]">
                                        <template v-slot:activator="{ props }">
                                            <v-btn variant="tonal"
                                            v-bind="props" :density="smAndDown?'compact':'default'"
                                            >
                                            <v-icon>mdi-arrow-down</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-card class="d-flex flex-column">
                                            <v-btn variant="tonal"
                                                v-for="(item, index) in staticType"
                                                :key="index"
                                                @click="switchType(item.type,'static')"
                                            >
                                                {{ item.name }}
                                            </v-btn>
                                        </v-card>
                                    </v-menu>
                                </div>
                            </div>
                            
                        </template>
                        <v-row class="scroll-container">
                            <v-col :cols="type == 'mobile' ? 6:12" :sm="type == 'mobile' ? 4:6" :md="type == 'mobile' ? 3:4" v-for="item in paginatedPICItems" :key="item.preview || item.url" class="d-flex justify-center">
                                <v-img rounded="lg" @click="radios = item" style="cursor: pointer"
                                :class="{'selected-item':radios === item }"
                                :max-width="smAndDown ? (type == 'mobile' ? 100 : 200) : (type == 'mobile' ? 160 : 250)"
                                :max-height="smAndDown ? (type == 'mobile' ? 170 : 120) : (type == 'mobile' ? 272 : 150)"
                                cover
                                :src="item.preview || item.url"
                                >
                                <template v-slot:placeholder>
                                    <v-row
                                        align="center"
                                        class="fill-height ma-0"
                                        justify="center"
                                    >
                                        <v-progress-circular
                                        color="grey-lighten-5"
                                        indeterminate
                                        ></v-progress-circular>
                                    </v-row>
                                </template>
                                </v-img>
                            </v-col>
                        </v-row>
                    </v-radio-group>
                    <v-pagination
                    v-model="currentPICPage"
                    :length="totalPICPages"
                    @input="updatePICPage"
                    :density="smAndDown? 'compact':'default'"
                    ></v-pagination>
                </div>
                <div v-if="item.value === 'tab-2'">
                    <v-radio-group v-model="radios" inline>
                        <template v-slot:label>
                            <div class="mb-2 d-flex justify-space-between" style="width: 100%;align-items: center;">
                                <div class="itemText"><strong :style="smAndDown?{'font-size':'13px'}:{}">{{ radios.title }}</strong></div>
                                <div class="d-flex align-center ga-2">
                                    <v-btn variant="tonal" :density="smAndDown?'compact':'default'" @click="selectRandomWallpaper">
                                        <v-icon>mdi-shuffle-variant</v-icon>
                                    </v-btn>
                                    <v-menu location="bottom" :offset="[0, 15]">
                                        <template v-slot:activator="{ props }">
                                            <v-btn variant="tonal" :density="smAndDown?'compact':'default'"
                                            v-bind="props"
                                            >
                                            <v-icon>mdi-arrow-down</v-icon>
                                            </v-btn>
                                        </template>
                                        <v-card class="d-flex flex-column">
                                            <v-btn variant="tonal"
                                                v-for="(item, index) in staticType"
                                                :key="index"
                                                @click="switchType(item.type,'dynamic')"
                                            >
                                                {{ item.name }}
                                            </v-btn>
                                        </v-card>
                                    </v-menu>
                                </div>
                            </div>
                        </template>
                        <v-row class="scroll-container">
                            <v-col :cols="type == 'mobile' ? 6:12" :sm="type == 'mobile' ? 4:6" :md="type == 'mobile' ? 3:4" v-for="item in paginatedVDItems" :key="item.preview || item.url" class="d-flex justify-center">
                                <div class="video-container" @click="radios = item" style="cursor: pointer">
                                    <!-- 加载提示 -->
                                    <div v-if="!item.loaded" class="loading-spinner">
                                        <v-progress-circular indeterminate></v-progress-circular>
                                    </div>
                                    <video autoplay loop muted 
                                        @click="item=radios"
                                        :class="{'selected-item':radios === item }"
                                        :style="type == 'mobile'?(smAndDown ?{width: '100px',height:'170px'}:{width: '160px',height:'272px'}):(smAndDown ?{width: '200px'}:{width: '250px'})"
                                        style="object-fit: cover;"
                                        rounded="lg" @loadeddata="item.loaded = true"
                                    >
                                        <source :src="item.preview || item.url" type="video/mp4">
                                    </video>
                                </div>
                            </v-col>
                        </v-row>
                    </v-radio-group>

                    <v-pagination
                    v-model="currentVDPage"
                    :length="totalVDPages"
                    @input="updateVDPage"
                    :density="smAndDown? 'compact':'default'"
                    ></v-pagination>
                </div>
            </v-tabs-window-item>
          </template>
        </v-tabs>
         <div style="text-align: center;font-size: 12px;"><span>不同壁纸在相应设备下响应</span></div>
    </v-container>
    <div class="d-flex justify-center mt-3">
        <v-btn variant="tonal" class="ma-2" @click="showRandomDialog = true">
            <v-icon left>mdi-image-multiple</v-icon>
            更多随机图片
        </v-btn>
    </div>
    <div class="d-flex justify-center mt-3">
        <v-btn :loading="loading1" variant="tonal" class="ma-2" @click="redefault()">恢复</v-btn>
        <v-btn :loading="loading3" variant="tonal" class="ma-2" @click="cancel()">取消</v-btn>
        <v-btn :loading="loading2" variant="tonal" class="ma-2" @click="submitdata()">确认</v-btn>
    </div>

    <!-- 随机图片弹窗 -->
    <v-dialog v-model="showRandomDialog" max-width="1200px" scrollable>
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <span>随机壁纸选择</span>
                <div class="d-flex align-center ga-2">
                    <v-btn variant="tonal" size="small" @click="generateRandomWallpapers" :loading="randomLoading">
                        <v-icon left>mdi-refresh</v-icon>
                        刷新
                    </v-btn>
                    <v-btn icon @click="showRandomDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>
            </v-card-title>
            <v-card-text style="height: 600px;">
                <div v-if="randomLoading" class="d-flex justify-center align-center" style="height: 100%;">
                    <v-progress-circular indeterminate size="64"></v-progress-circular>
                </div>
                <div v-else class="random-masonry-grid">
                    <div v-for="(item, index) in randomWallpapers" :key="index" 
                         class="random-masonry-item" 
                         @click="selectRandomItem(item)"
                         :class="{'selected-random-item': radios === item}">
                        <v-img
                            :src="item.preview"
                            :aspect-ratio="item.aspectRatio || 16/9"
                            cover
                            class="random-wallpaper-img"
                        >
                            <template v-slot:placeholder>
                                <div class="d-flex align-center justify-center fill-height">
                                    <v-progress-circular indeterminate></v-progress-circular>
                                </div>
                            </template>
                            <div class="image-overlay">
                                <div class="image-title">{{ item.title }}</div>
                            </div>
                        </v-img>
                    </div>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>

    <v-snackbar
      :timeout="2000"
      color="info"
      rounded="pill"
      location="top"
      v-model="snackbar"
    >
    请选择壁纸
    </v-snackbar>
  </template>

<script>
import { useDisplay } from 'vuetify';
import { setCookie, getCookie, eraseCookie } from '../../utils/cookieUtils.js';
import config from '../../config.js';
export default {
    emits: ['cancel'],
    setup() {
        const { smAndDown } = useDisplay();
        return { smAndDown };
    },
    data () {
        return {
            loading1: false,
            loading2: false,
            loading3: false,
            snackbar:false,
            configdata:config,
            background: {'pc':{},'mobile':{}},
            wallpaperPIC: null,
            wallpaperVD: null,
            radios: {},
            currentVDPage: 1,
            currentPICPage: 1,
            itemsPerPage: 6, // 每页显示的item数量
            tab: null,
            tabs: [
                {
                    icon: 'mdi-panorama-variant-outline',
                    text: '图片壁纸',
                    value: 'tab-1',
                },
                {
                    icon: 'mdi-video-input-svideo',
                    text: '动态壁纸',
                    value: 'tab-2',
                },
            ],
            staticType: [
                { type: 'pc',name: '电脑壁纸' },
                { type: 'mobile',name: '手机壁纸' },
            ],
            type:'pc',
            // 随机壁纸功能相关
            showRandomDialog: false,
            randomWallpapers: [],
            randomLoading: false,
            lastRandomSelection: null,
            currentRandomWallpaper: null, // 当前随机生成的壁纸
        }
    },
    mounted() {
        if(import.meta.env.VITE_CONFIG){
            this.configdata = JSON.parse(import.meta.env.VITE_CONFIG);
        }
        this.wallpaperPIC = this.configdata.wallpaper.pic;
        this.wallpaperVD = this.configdata.wallpaper.video;
        this.radios.title = "请选择壁纸";
        
        // 初始化随机壁纸
        this.generateRandomWallpapers();
    },
    watch: {
        tab(val) {
            this.type = 'pc';
            this.itemsPerPage = 6;
            if(val == 'tab-1'){
                this.wallpaperPIC = this.configdata.wallpaper.pic;
            }else{
                this.wallpaperVD = this.configdata.wallpaper.video;
            }
            
            // 如果当前有随机壁纸且类型不匹配，清除它
            if (this.currentRandomWallpaper) {
                const newType = val === 'tab-1' ? 'pic' : 'video';
                if (this.currentRandomWallpaper.type !== newType) {
                    this.currentRandomWallpaper = null;
                    // 如果当前选中的是随机壁纸，也需要清除选择
                    if (this.radios && this.radios.isRandom) {
                        this.radios = {};
                        this.radios.title = "请选择壁纸";
                    }
                }
            }
        }
    },
    computed: {
        // 计算总页数
        totalVDPages() {
            const items = this.getVideoWallpapers();
            return Math.ceil(items.length / this.itemsPerPage);
        },
        totalPICPages() {
            const items = this.getPictureWallpapers();
            return Math.ceil(items.length / this.itemsPerPage);
        },
        // 计算当前页显示的item - 包含随机壁纸
        paginatedPICItems(){
            const items = this.getPictureWallpapers();
            const start = (this.currentPICPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return items.slice(start, end);
        },
        paginatedVDItems() {
            const items = this.getVideoWallpapers();
            const start = (this.currentVDPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return items.slice(start, end);
        },
    },
    methods: {
        setCookie,
        getCookie,
        eraseCookie,
        
        // 获取图片壁纸列表（包含随机壁纸）
        getPictureWallpapers() {
            let wallpapers = [...this.wallpaperPIC];
            
            // 如果有随机壁纸且当前是图片选项卡，将其添加到列表开头
            if (this.currentRandomWallpaper && this.currentRandomWallpaper.type === 'pic' && this.currentRandomWallpaper.deviceType === this.type) {
                wallpapers.unshift(this.currentRandomWallpaper);
            }
            
            return wallpapers;
        },
        
        // 获取动态壁纸列表（包含随机壁纸）
        getVideoWallpapers() {
            let wallpapers = [...this.wallpaperVD];
            
            // 如果有随机壁纸且当前是动态选项卡，将其添加到列表开头
            if (this.currentRandomWallpaper && this.currentRandomWallpaper.type === 'video' && this.currentRandomWallpaper.deviceType === this.type) {
                wallpapers.unshift(this.currentRandomWallpaper);
            }
            
            return wallpapers;
        },
        submitdata() {
            if(!this.radios.url){
                this.snackbar = true;
                return;
            }
            let leleodatabackground = this.getCookie("leleodatabackground");
            delete this.radios.loaded;
            if(this.type == 'mobile'){
                this.background.mobile.type= this.tab === 'tab-1'? 'pic' : 'video';
                this.background.mobile.datainfo = this.radios;
                if(leleodatabackground){
                    this.background.pc = leleodatabackground.pc;
                }else{
                    this.background.pc = this.configdata.background.pc;
                }
            }else{
                this.background.pc.type= this.tab === 'tab-1'? 'pic' : 'video';
                this.background.pc.datainfo = this.radios;
                if(leleodatabackground){
                    this.background.mobile = leleodatabackground.mobile;
                }else{
                    this.background.mobile = this.configdata.background.mobile;
                }
            }

            this.loading2 = true
            setTimeout(() => {
                this.loading = false;
                this.setCookie('leleodatabackground', this.background,0.005);
                location.reload();
            }, 800)   
        },
        redefault(){              
            this.loading1 = true
            setTimeout(() => {
                this.loading = false;
                this.eraseCookie('leleodatabackground');
                location.reload();
            }, 800) 
        },
        cancel() {
            this.$emit('cancel');
        },
        // 更新当前页
        updateVDPage(page) {
            this.currentVDPage = page;
        },
        updatePICPage(page) {
            this.currentPICPage = page;
        },
        switchType(type,tabtype){
            if(tabtype == 'static'){
                if(type == 'mobile'){
                    this.type='mobile';
                    this.itemsPerPage = 8;
                    this.wallpaperPIC = this.configdata.wallpaper.picMobile;
                }else if(type == 'pc'){
                    this.type='pc';
                    this.itemsPerPage = 6;
                    this.wallpaperPIC = this.configdata.wallpaper.pic;
                }
                this.currentPICPage = 1;
            }else{
                if(type == 'mobile'){
                    this.type='mobile';
                    this.itemsPerPage = 8;
                    this.wallpaperVD = this.configdata.wallpaper.videoMobile;
                }else if(type == 'pc'){
                    this.type='pc';
                    this.itemsPerPage = 6;
                    this.wallpaperVD = this.configdata.wallpaper.video;
                }
                this.currentVDPage = 1;
            }
            
            // 如果当前有随机壁纸且设备类型不匹配，清除它
            if (this.currentRandomWallpaper && this.currentRandomWallpaper.deviceType !== type) {
                this.currentRandomWallpaper = null;
                // 如果当前选中的是随机壁纸，也需要清除选择
                if (this.radios && this.radios.isRandom) {
                    this.radios = {};
                    this.radios.title = "请选择壁纸";
                }
            }
        },
        // 随机壁纸选择功能
        async selectRandomWallpaper() {
            try {
                let randomWallpaper;
                const timestamp = Date.now();
                
                if (this.tab === 'tab-1') { // 图片壁纸
                    // 调用随机壁纸API
                    const apiUrl = this.type === 'mobile' ? 'https://t.mwm.moe/mp' : 'https://t.mwm.moe/pc';
                    
                    randomWallpaper = {
                        title: `随机壁纸_${timestamp}`,
                        preview: `${apiUrl}?t=${timestamp}`,
                        url: `${apiUrl}?t=${timestamp}`,
                        type: 'pic',
                        deviceType: this.type,
                        isRandom: true
                    };
                } else { // 动态壁纸 - 从现有库中随机选择
                    const wallpapers = this.type === 'mobile' ? 
                        this.configdata.wallpaper.videoMobile : 
                        this.configdata.wallpaper.video;
                    
                    if (wallpapers.length === 0) return;
                    
                    // 获取随机壁纸，确保不重复上次选择
                    let selectedWallpaper;
                    do {
                        const randomIndex = Math.floor(Math.random() * wallpapers.length);
                        selectedWallpaper = wallpapers[randomIndex];
                    } while (wallpapers.length > 1 && selectedWallpaper === this.lastRandomSelection);
                    
                    randomWallpaper = {
                        ...selectedWallpaper,
                        type: 'video',
                        deviceType: this.type,
                        isRandom: true
                    };
                }
                
                // 设置当前随机壁纸
                this.currentRandomWallpaper = randomWallpaper;
                
                // 选中这个随机壁纸
                this.radios = randomWallpaper;
                this.lastRandomSelection = randomWallpaper;
                
                // 跳转到第一页以显示随机壁纸
                if (this.tab === 'tab-1') {
                    this.currentPICPage = 1;
                } else {
                    this.currentVDPage = 1;
                }
                
            } catch (error) {
                console.error('获取随机壁纸失败:', error);
                // 如果API调用失败，fallback到本地壁纸
                this.selectFromLocalWallpapers();
            }
        },
        
        // Fallback方法：从本地壁纸中随机选择
        selectFromLocalWallpapers() {
            let wallpapers = [];
            
            if (this.tab === 'tab-1') {
                wallpapers = this.type === 'mobile' ? 
                    this.configdata.wallpaper.picMobile : 
                    this.configdata.wallpaper.pic;
            } else {
                wallpapers = this.type === 'mobile' ? 
                    this.configdata.wallpaper.videoMobile : 
                    this.configdata.wallpaper.video;
            }
            
            if (wallpapers.length === 0) return;
            
            const randomIndex = Math.floor(Math.random() * wallpapers.length);
            const selectedWallpaper = wallpapers[randomIndex];
            
            // 创建随机壁纸对象
            const randomWallpaper = {
                ...selectedWallpaper,
                type: this.tab === 'tab-1' ? 'pic' : 'video',
                deviceType: this.type,
                isRandom: true
            };
            
            // 设置当前随机壁纸
            this.currentRandomWallpaper = randomWallpaper;
            
            // 选中这个随机壁纸
            this.radios = randomWallpaper;
            
            // 跳转到第一页以显示随机壁纸
            if (this.tab === 'tab-1') {
                this.currentPICPage = 1;
            } else {
                this.currentVDPage = 1;
            }
        },
        // 生成随机壁纸预览
        async generateRandomWallpapers() {
            this.randomLoading = true;
            
            try {
                const selectedWallpapers = [];
                const wallpaperCount = 12;
                
                // 生成随机图片
                for (let i = 0; i < wallpaperCount; i++) {
                    const timestamp = Date.now() + i; // 确保每张图片都不同
                    const pcApiUrl = `https://t.mwm.moe/pc?t=${timestamp}`;
                    const mobileApiUrl = `https://t.mwm.moe/mp?t=${timestamp}`;
                    
                    const wallpaper = {
                        title: `随机壁纸_${timestamp}`,
                        preview: pcApiUrl, // 弹窗中统一使用PC版图片以获得更好的显示效果
                        url: pcApiUrl,
                        mobileUrl: mobileApiUrl, // 保存移动端URL以备使用
                        aspectRatio: 0.6 + Math.random() * 0.8, // 随机高宽比
                        isRandom: true // 标记为随机图片
                    };
                    
                    selectedWallpapers.push(wallpaper);
                }
                
                // 模拟加载时间以提供更好的用户体验
                await new Promise(resolve => setTimeout(resolve, 800));
                
                this.randomWallpapers = selectedWallpapers;
            } catch (error) {
                console.error('生成随机壁纸失败:', error);
                // 如果API失败，使用本地壁纸作为fallback
                this.generateLocalRandomWallpapers();
            } finally {
                this.randomLoading = false;
            }
        },
        
        // Fallback方法：从本地壁纸生成随机预览
        generateLocalRandomWallpapers() {
            try {
                const allWallpapers = [
                    ...this.configdata.wallpaper.pic,
                    ...this.configdata.wallpaper.picMobile,
                ];
                
                const selectedWallpapers = [];
                const usedIndexes = new Set();
                
                while (selectedWallpapers.length < Math.min(12, allWallpapers.length)) {
                    const randomIndex = Math.floor(Math.random() * allWallpapers.length);
                    if (!usedIndexes.has(randomIndex)) {
                        usedIndexes.add(randomIndex);
                        const wallpaper = { ...allWallpapers[randomIndex] };
                        wallpaper.aspectRatio = 0.6 + Math.random() * 0.8;
                        selectedWallpapers.push(wallpaper);
                    }
                }
                
                this.randomWallpapers = selectedWallpapers;
            } catch (error) {
                console.error('生成本地随机壁纸失败:', error);
                this.randomWallpapers = [];
            }
        },
        // 选择随机弹窗中的壁纸
        selectRandomItem(item) {
            // 如果是随机图片，需要根据当前设备类型调整URL
            if (item.isRandom) {
                const selectedWallpaper = {
                    title: item.title,
                    preview: this.type === 'mobile' ? 
                        (item.mobileUrl || `https://t.mwm.moe/mp?t=${Date.now()}`) : 
                        item.url,
                    url: this.type === 'mobile' ? 
                        (item.mobileUrl || `https://t.mwm.moe/mp?t=${Date.now()}`) : 
                        item.url
                };
                this.radios = selectedWallpaper;
            } else {
                this.radios = item;
            }
            
            this.showRandomDialog = false;
        },
    },

}
</script>
<style scoped>
@import url(/css/mobile.less);
</style>
<style scoped>
video{
    pointer-events: none;
    border-radius: 0.5rem;
}
.itemText{
    width: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.loading-spinner {
    position: absolute;
     top: 50%;
    left: 50%;
     transform: translate(-50%, -50%); 
    z-index: 1; 
}
.video-container {
    position: relative;
    display: flex;
}

.scroll-container {
    max-height: 300px;
    overflow-y: auto;
}

/* 覆盖全局的滚动条样式 */
.scroll-container::-webkit-scrollbar {
  width: 5px; /* 设置滚动条宽度 */
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: #888; /* 设置滚动条颜色 */
  border-radius: 4px; /* 设置滚动条圆角 */
}
.selectedStyle{
    border: 2px solid var(--leleo-vcard-color);
    
    box-shadow: 0 0 10px rgba(25, 118, 210, 0.5),;
}

.selected-item {
  border-color: var(--leleo-vcard-color); /* 选中时的边框颜色 */
  box-shadow: 0 0 10px var(--leleo-vcard-color); /* 选中时的阴影 */
}

/* 随机壁纸弹窗样式 */
.random-masonry-grid {
  column-count: 3;
  column-gap: 16px;
  column-fill: balance;
}

@media (max-width: 768px) {
  .random-masonry-grid {
    column-count: 2;
    column-gap: 12px;
  }
}

@media (max-width: 480px) {
  .random-masonry-grid {
    column-count: 2;
    column-gap: 8px;
  }
}

.random-masonry-item {
  break-inside: avoid;
  margin-bottom: 16px;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.random-masonry-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.random-wallpaper-img {
  border-radius: 8px;
  width: 100%;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 16px 12px 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.random-masonry-item:hover .image-overlay {
  opacity: 1;
}

.image-title {
  font-size: 13px;
  font-weight: 500;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.selected-random-item {
  border: 2px solid var(--leleo-vcard-color);
  box-shadow: 0 0 15px var(--leleo-vcard-color);
}

.selected-random-item .image-overlay {
  opacity: 1;
  background: linear-gradient(transparent, rgba(var(--leleo-vcard-color-rgb, 25, 118, 210), 0.8));
}

/* 弹窗动画效果 */
.v-dialog--active {
  animation: dialogFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>