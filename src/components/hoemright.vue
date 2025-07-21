<template>
      <div>
        <!-- 项目图片详情页面 -->
        <div v-if="showProjectGallery">
          <ProjectGallery
            :project-path="selectedProject.path"
            :project-name="selectedProject.name"
            @back="showProjectGallery = false"
          />
        </div>

        <!-- 主页内容 -->
        <div v-else>
          <div>
            <div :style="xs||sm?{'display':'none'}:{'font-size':'4rem'}" class="leleo-left-welcome">{{ configdata.welcometitle }}</div>
          </div>
          <div>
            <v-row align="center">
              <v-col cols="12" md="8">
                <typewriter class="ma-3 d-flex align-center justify-center" style="min-height: 200px;"></typewriter>
              </v-col>
              <v-col cols="12" md="4" align="center">
                <v-card class="ma-3" hover
                  >
                    <template v-slot:title >
                      <span class="leleo-card-title clock-font">{{formattedTime}}</span>
                    </template>
                    <template v-slot:subtitle>
                      <span style="font-weight: bold;">{{formattedDate}}</span>
                    </template>
                    <turntable />
                </v-card>
              </v-col>
            </v-row>
            
            <div class="projects-section">
              <v-chip class="mt-3 ml-3" prepend-icon="mdi-camera"  size="large" style="color: var(--leleo-vcard-color);">
                摄影作品集
              </v-chip>
              
              <!-- 项目加载状态 -->
              <div v-if="projectsLoading" class="projects-loading">
                <v-container>
                  <v-row justify="center">
                    <v-col cols="12" class="text-center">
                      <v-progress-circular 
                        indeterminate 
                        color="primary" 
                        size="60"
                      ></v-progress-circular>
                      <p style="margin-top: 20px; color: #666;">正在从GitHub加载项目...</p>
                    </v-col>
                  </v-row>
                </v-container>
              </div>

              <!-- 项目错误状态 -->
              <div v-else-if="projectsError" class="projects-error">
                <v-container>
                  <v-row justify="center">
                    <v-col cols="12" class="text-center">
                      <v-icon size="60" color="error">mdi-alert-circle</v-icon>
                      <h3 style="margin-top: 20px; color: #666;">加载项目失败</h3>
                      <p style="color: #999; margin-bottom: 20px;">无法从GitHub获取项目数据</p>
                      <v-btn @click="loadDynamicProjects" variant="outlined" color="primary">
                        重试
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </div>

              <!-- 项目列表 -->
              <v-container v-else>
                <v-row>
                  <v-col
                    v-for="(item,key) in displayProjects"
                    :key="item.id || key"
                    cols="6"
                    md="4"
                    lg="3"
                    :style="xs?{'padding': '6px'}:{}"
                  >
                    <v-card class="project-card" hover>
                      <div class="image-container">
                        <v-img
                          aspect-ratio="1.7778"
                          :src="item.img"
                          cover
                          :style="{ opacity: 0.8 }"
                          class="project-image"
                        >
                          <template v-slot:placeholder>
                            <v-row
                              class="fill-height ma-0"
                              align="center"
                              justify="center"
                            >
                              <v-progress-circular 
                                indeterminate 
                                color="grey lighten-5"
                              ></v-progress-circular>
                            </v-row>
                          </template>
                        </v-img>
                        
                        <!-- 图片数量标识 -->
                        <div class="image-count-badge" v-if="item.imageCount">
                          <v-chip size="small" color="rgba(0,0,0,0.7)" style="color: white;">
                            <v-icon left size="16">mdi-image-multiple</v-icon>
                            {{ item.imageCount }}
                          </v-chip>
                        </div>
                      </div>
                      
                      <v-card-title :style="xs?{'font-size': '0.9rem','padding': '0.15rem 0.5rem'}:{'font-size': '1.1rem','padding':'0.2rem 0.8rem'}">
                        {{item.title}}
                      </v-card-title>
                      <v-card-subtitle :style="xs?{'font-size': '0.6rem','padding': '0.1rem 0.5rem'}:{'font-size': '0.8rem','padding':'0.15rem 0.6rem'}">
                        {{ item.subtitle }}
                      </v-card-subtitle>

                      <v-card-actions :style="xs||sm||md?{'padding': '0','min-height': '0','height':'2.5rem'}:{'min-height': '0','height':'2.8rem'}">
                        <v-btn 
                          v-if="item.url"
                          :href="item.url"
                          target="_blank"
                          :text="item.go"
                        ></v-btn>
                        <v-btn 
                          v-else
                          @click="openProjectGallery(item)"
                          :text="item.go"
                          color="primary"
                        ></v-btn>
                        <v-spacer></v-spacer>
                        <v-btn
                          :icon="item.show ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                          @click="item.show = !item.show;projectcardsShow(key);"
                        ></v-btn>
                      </v-card-actions>
                      <v-expand-transition>
                        <div v-show="item.show">
                          <v-divider></v-divider>
                          <v-card-text :style="xs?{'font-size': '0.7rem'}:{}">
                            {{item.text}}
                          </v-card-text>
                        </div>
                      </v-expand-transition>
                    </v-card>
                  </v-col>
                </v-row>
                
                <!-- 刷新项目按钮 -->
                <v-row v-if="displayProjects.length > 0" justify="center" class="mt-4">
                  <v-col cols="auto">
                    <v-btn 
                      @click="refreshProjects"
                      :loading="projectsLoading"
                      variant="outlined"
                      prepend-icon="mdi-refresh"
                    >
                      刷新项目
                    </v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </div>
          </div>       
        </div>
      </div>
</template> 

<script>
import typewriter from '../components/typewriter.vue';
import turntable from '../components/turntable.vue';
import ProjectGallery from '../components/ProjectGallery.vue';
import githubApiService from '../services/githubApi.js';
import { useDisplay } from 'vuetify'

export default {
    components: {
        typewriter,
        turntable,
        ProjectGallery
    },
    props: ['configdata','formattedTime','formattedDate','projectcards'],
    data() {
        return {
            projectsLoading: false,
            projectsError: false,
            dynamicProjects: [],
            showProjectGallery: false,
            selectedProject: null
        };
    },
    computed: {
        displayProjects() {
            // 优先显示动态项目，如果加载失败则显示静态项目
            if (this.dynamicProjects.length > 0) {
                return this.dynamicProjects;
            }
            return this.projectcards || [];
        }
    },
    setup() {
      const { xs,sm,md } = useDisplay();
      return {xs,sm,md};
    },
    mounted() {
        // 组件挂载后立即加载动态项目
        this.loadDynamicProjects();
    },
    methods:{
        projectcardsShow(key){
            const projects = this.displayProjects;
            for(let i = 0; i < projects.length; i++){
                if(i != key){
                    projects[i].show = false;
                }
            }
        },

        async loadDynamicProjects() {
            this.projectsLoading = true;
            this.projectsError = false;

            try {
                console.log('开始加载GitHub项目数据...');
                const projects = await githubApiService.getProjectsWithImages();
                
                if (projects && projects.length > 0) {
                    this.dynamicProjects = projects;
                    console.log(`成功加载 ${projects.length} 个项目`);
                } else {
                    console.log('未获取到项目数据，使用静态项目');
                }
            } catch (error) {
                console.error('加载GitHub项目失败:', error);
                this.projectsError = true;
                
                // 如果是网络错误或API限制，显示友好提示
                if (error.message.includes('403')) {
                    console.log('GitHub API访问受限，使用静态项目数据');
                } else if (error.message.includes('404')) {
                    console.log('GitHub仓库未找到，请检查仓库配置');
                }
            } finally {
                this.projectsLoading = false;
            }
        },

        refreshProjects() {
            // 清除缓存并重新加载
            githubApiService.clearCache();
            this.loadDynamicProjects();
        },

        openProjectGallery(project) {
            if (project.path) {
                this.selectedProject = project;
                this.showProjectGallery = true;
            } else {
                console.warn('项目缺少路径信息:', project);
            }
        }
    }
};
</script>

<style scoped>
@import url(/css/app.less);
@import url(/css/mobile.less);

.projects-section {
  margin-top: 20px;
}

.projects-loading,
.projects-error {
  padding: 40px 20px;
}

.project-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.image-container {
  position: relative;
  overflow: hidden;
}

.project-image {
  transition: transform 0.3s ease;
}

.project-card:hover .project-image {
  transform: scale(1.05);
}

.image-count-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.image-count-badge .v-chip {
  backdrop-filter: blur(4px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .projects-section {
    margin-top: 10px;
  }
  
  .image-count-badge {
    top: 4px;
    right: 4px;
  }
}
</style>