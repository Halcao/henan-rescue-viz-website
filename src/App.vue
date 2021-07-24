<template>
  <div id="app">
    <div class="info">
      <div>本网站仅聚合新浪微博上发布的有关2021年7月河南暴雨的求助信息，请大家注意辨别信息真伪。点击标记点可以看到更多信息及原微博地址。</div>
      <br/>
      <label>
        <input id="sliderRange" type="range" min="2" max="12" v-model="timeRange" @onChange="handleSliderChange()"
               step="2"/>
        最近 {{ timeRange }} 小时
      </label>
    </div>

    <baidu-map class="map" :center="center" :scroll-wheel-zoom="true" :zoom="zoom" @ready="handler">
      <bm-navigation anchor="BMAP_ANCHOR_TOP_RIGHT"/>

      <bm-marker v-for="item of displayData" :position="item.location" :key="item.id" @click="infoWindowOpen(item)">
      </bm-marker>
      <bm-info-window :show="infoWindow.show" :position="infoWindow.info.location" @close="infoWindowClose"
                      @open="infoWindowOpen" :offset="{ width: 0, height: -20 }">
        <div>{{ infoWindow.info.post }}</div>
        <div>
          原微博：
          <a target="_blank" rel="noopener noreferrer" :href="infoWindow.info.link">{{ infoWindow.info.link }}</a>
        </div>
        <div>{{ `发布时间: 7月 ${infoWindow.info.Time.substring(8, 10)}日 ${infoWindow.info.Time.substring(11, 20)}` }}</div>

      </bm-info-window>
    </baidu-map>

  </div>
</template>

<script>
import Vue from 'vue'
import BaiduMap from 'vue-baidu-map'

Vue.use(BaiduMap, {
  ak: 'mTM4lv5gl2AenfvEuC8hV6DMGyWF4mBZ'
})

export default {
  name: 'App',
  data: function () {
    return {
      data: [],
      center: {
        lng: 113.802193,
        lat: 34.820333
      },
      zoom: 9,
      timeRange: 8,
      infoWindow: {
        show: false,
        info: {
          location: {lng: 0, lat: 0},
          Time: '',
          link: '',
          post: ''
        }
      }
    };
  },
  computed: {
    displayData() {
      const currentTimestamp = Date.now()
      return this.data.filter(item => currentTimestamp - Date.parse(item["Time"]) < this.timeRange * 60 * 60 * 1000)
    }
  },
  components: {},
  mounted() {
    fetch('https://api-henan.tianshili.me/parse_json.json')
        .then(res => res.json())
        .then(res => {
          res = res.map(e => {
            const arr = e.link.split('/')
            e.id = arr[arr.length - 1]
            e.location.lag += Math.random()/1000
            e.location.lat += Math.random()/1000
            return e
          })

          this.data = res
        })
  },
  methods: {
    handler({BMap, map}) {
      console.log(BMap, map)
    },
    handleSliderChange() {
      console.log(this.timeRange)
    },
    infoWindowOpen(info) {
      this.infoWindow.show = true
      this.infoWindow.info = info
    },
    infoWindowClose() {
      this.infoWindow.show = false
    }
  }
}
</script>

<style>

.map {
  position: absolute;
  top: 0;
  bottom: 0;
  /*top: 40px; !* Header Height *!*/
  /*bottom: 20px; !* Footer Height *!*/
  width: 100%;
}

.info {
  z-index: 999;
  width: auto;
  padding: .75rem 1.25rem;
  margin-left: 1.25rem;
  margin-right: 1.25rem;
  position: fixed;
  top: 1rem;
  background-color: #fff;
  border-radius: .25rem;
  font-size: 14px;
  color: #666;
  box-shadow: 0 2px 6px 0 rgba(27, 142, 236, 0.5);
}


</style>
