import Vue from 'vue'
import App from './App.vue'
import VueResource from 'vue-resource';

Vue.use(VueResource);

// Configuration
Vue.http.options.emulateJSON = true;
Vue.http.options.credentials = true
Vue.http.options.xhr = {withCredentials: true}

Vue.http.interceptors.push((request, next) => {
  request.credentials = true;
  next();
});
// Vue.http.options.root = "http://localhost:1337/api";

new Vue({
  el: '#app',
  render: h => h(App)
})
