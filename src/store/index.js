import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    playSong: {
      url: window.sessionStorage.getItem('url'),
      img: window.sessionStorage.getItem('img'),
      name: window.sessionStorage.getItem('name'),
      singer: window.sessionStorage.getItem('singer'),
      lyric: window.sessionStorage.getItem('lyric'),
      num: -1
    },
    playIf: false,
    audio: {},
    active: 0,
    metaDuration: 0,
    metaCurrentTime: 0,
    activeName: '',
    songs: window.sessionStorage.getItem('songs'),
    total: window.sessionStorage.getItem('total'),
    name: window.sessionStorage.getItem('name')
  },
  getters: {
    percentage (state) {
      if (state.metaDuration === 0) {
        return 0
      }
      return Math.floor(state.metaCurrentTime / state.metaDuration * 100)
    },
    duration (state) {
      const double = function (num) {
        if (num.toString().length !== 2) {
          if (num === 0) {
            return '00'
          }
          return '0' + num
        }
        return num
      }
      return `${double(Math.floor(state.metaDuration / 60))}:${double(Math.floor(state.metaDuration % 60))}`
    },
    currentTime (state) {
      const double2 = function (num) {
        if (num.toString().length !== 2) {
          if (num === 0) {
            return '00'
          }
          return '0' + num
        }
        return num
      }
      return `${double2(Math.floor(state.metaCurrentTime / 60))}:${double2(Math.floor(state.metaCurrentTime % 60))}`
    }
    // 返回两位数
    // double (state, num) {
    //   if (num.toString().length !== 2) {
    //     return '0' + num
    //   }
    //   return num
    // },
  },
  mutations: {
    playUrl (state, payload) {
      state.playSong.url = payload.url
      state.playSong.img = payload.img
      state.playSong.name = payload.name
      state.playSong.singer = payload.singer
      state.playSong.lyric = payload.lyric
      state.playSong.num = payload.num
      console.log(state.playSong.num)
      console.log(state.playSong.singer)
      state.playIf = true
      window.sessionStorage.setItem('url', payload.url)
      window.sessionStorage.setItem('img', payload.img)
      window.sessionStorage.setItem('name', payload.name)
      window.sessionStorage.setItem('singer', payload.singer)
      window.sessionStorage.setItem('lyric', payload.lyric)
      console.log(state.playSong.lyric)
    },
    ended (state, num) {
      // 让musicPlayer里面的播放标签变为停止标签
      // state.playSong.url = state.info
      // state.playSong.img = state.info.al.picUrl
      // state.playSong.name = state.info.name
      // state.playSong.singer = state.info.al.name
      if (state.playSong.num === state.total - 1) {
        state.playSong.num = 0
      } else {
        state.playSong.num = num + 1
      }
      state.playIf = false
      state.active = 0
      // console.log(this.$refs.songTable.active--)
    },
    getDuration (state, audio) {
      // state.duration = `${Math.floor(audio.duration / 60)}:${Math.floor(audio.duration % 60)}`
      state.metaDuration = audio.duration
      state.metaCurrentTime = audio.currentTime
      state.audio = audio
    },
    getCurrentTime (state) {
      // state.currentTime = `${Math.floor(state.audio.currentTime / 60)}:${Math.floor(state.audio.currentTime % 60)}`
      state.metaCurrentTime = state.audio.currentTime
    },
    pauseMusic (state) {
      state.playIf = false
      state.audio.pause()
    },
    playMusic (state) {
      if (state.playUrl !== '') {
        state.audio.play()
        state.playIf = true
      }
    },
    playSong (state) {
      if (state.playUrl !== '') {
        state.audio.play()
        state.playIf = true
        state.active = state.active - 1
      }
    },
    pauseSong (state) {
      state.playIf = false
      state.audio.pause()
      state.active = state.active + 1
    },
    editActive (state, num) {
      state.active = num
    },
    editActiveName (state, name) {
      state.activeName = name
    },
    getTotal (state, total) {
      window.sessionStorage.setItem('total', total)
      state.total = total
    },
    editPreNum (state) {
      if (state.playSong.num === 0) {
        state.playSong.num = state.total - 1
      } else {
        state.playSong.num--
      }
    },
    editNextNum (state) {
      if (state.playSong.num === state.total - 1) {
        state.playSong.num = 0
      } else {
        state.playSong.num++
      }
    },
    getSongs (state, songs) {
      window.sessionStorage.setItem('songs', songs)
      state.songs = songs
      // this.play(0)
    },
    editName (state, name) {
      state.name = name
    }
    // getInfo (state, info) {
    //   state.info = info
    // }
  },
  actions: {
    play (context, payload) {
      axios.all([axios.get(`/song/url?id=${context.state.songs[payload.num].id}`), axios.get(`/lyric?id=${context.state.songs[payload.num].id}`)])
        .then(axios.spread(({ data: url }, { data: lyric }) => {
          if (url.code !== 200 || lyric.code !== 200) {
            return
          }
          console.log(lyric)
          context.commit('editActive', context.state.songs[payload.num].id)
          context.commit('editName', payload.name)
          window.sessionStorage.setItem('name', payload.name)
          if (payload.name === 'songs') {
            context.commit('playUrl', { url: url.data[0].url, img: context.state.songs[payload.num].artists[0].img1v1Url, name: context.state.songs[payload.num].name, singer: context.state.songs[payload.num].artists[0].name, lyric: lyric, num: payload.num })
          } else {
            context.commit('playUrl', { url: url.data[0].url, img: context.state.songs[payload.num].al.picUrl, name: context.state.songs[payload.num].name, singer: context.state.songs[payload.num].al.name, lyric: lyric, num: payload.num })
          }
        }))
    }
  },
  modules: {
  }
})
