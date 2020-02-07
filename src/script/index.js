//引入样式
require('../style/style');

// 引入 Vue & axios
import Vue from '../../node_modules/vue/dist/vue.js';
import axios from 'axios';

// 引入&挂载 echarts
import echarts from 'echarts';
Vue.prototype.$echarts = echarts;

// 计算 rem
(function (doc, win) {
	var docEl = doc.documentElement,
		resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
		recalc = function () {
			var clientWidth = docEl.clientWidth;
			if (!clientWidth) return;
			docEl.style.fontSize = window.screen.width / 10 + 'px';
		};
	if (!doc.addEventListener) return;
	win.addEventListener(resizeEvt, recalc, false);
	doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);

new Vue({
	el: "#app",
	data(){
		return {
			userInfo: {},
			items: [],
			popup: null,
			cacheVal: '',
			cacheCommentUserId: '',
			cacheCommentUserName: '',
			isShowLoading: false,
			isOnLoading: false,
		}
	},
	created(){
		// 获取用户信息&是否有新消息
		axios.get('http://localhost/static/json/userInfo.json').then((res)=>{
			if(res.data.status == 200){
				this.userInfo = res.data.result
			}
		})

		// 获取作品信息
		axios.get('http://localhost/static/json/itemInfo.json').then((res)=>{
			if(res.data.status == 200){
				// 遍历 - 默认隐藏输入框 & 评论大于3条隐藏
				res.data.result.forEach((item)=>{
					if(item.comment.comments.length > 3)	item.showComment = false;
					else									item.showComment = true;
					item.showInput = false;
					this.items.push(item)
				})
			}
		})

	},
	mounted () {
		// 下滑懒加载 监听向下滚动事件
		this.$nextTick(function () {
			window.addEventListener('scroll', this.onScroll);
		});

		//创建雷达图 
		setTimeout(() => {
			this.items.forEach(i => {
				this.createRadar(i.itemId, i.radar);
			})
		}, 5000);
	},
	methods:{
		createRadar(id, val){
			// 初始化 echarts
			let myChart = this.$echarts.init(document.getElementById('radar'+id))
			// 绘制图表
			myChart.setOption({
				radar: {
					name: {
						textStyle: {
							color: '#fff',
							backgroundColor: '#999',
						}
					},
					splitArea: {
						areaStyle: {
							color: ['rgba(114, 172, 209, 0.2)',
								'rgba(114, 172, 209, 0.4)', 'rgba(114, 172, 209, 0.6)',
								'rgba(114, 172, 209, 0.8)', 'rgba(114, 172, 209, 1)'],
							shadowColor: 'rgba(0, 0, 0, 0.3)',
							shadowBlur: 10
						}
					},
					axisLine: {
						lineStyle: {
							color: 'rgba(255, 255, 255, 0.5)'
						}
					},
					splitLine: {
						lineStyle: {
							color: 'rgba(255, 255, 255, 0.5)'
						}
					},
					indicator: [
						{ name: '标准1', max: 100},
						{ name: '标准2', max: 100},
						{ name: '标准3', max: 100},
						{ name: '标准4', max: 100},
						{ name: '标准5', max: 100},
						{ name: '标准6', max: 100}
					]
				},
				series: [{
					type: 'radar',
					data: [
						{
							value: val,
							color: 'rgba(255, 255, 255, 0.5)',
							areaStyle: {
								color: 'rgba(255, 255, 255, 0.5)'
							}
						},
					]
				}]
			});
		},
		// 展开&收起 评论内容
		openComment(index){
			this.items[index].showComment = !(this.items[index].showComment);
		},

		// 打开 评论输入框
		showInputButton(index, commentUserId=null, commentUserName=null){
			this.cacheVal = '';
			this.cacheCommentUserId = '';
			if(!commentUserName)	this.cacheCommentUserName = this.items[index].comment.teacherName;
			else					this.cacheCommentUserName = commentUserName;
			
			this.items.forEach((v)=>{
				v.showInput = false;
			})
			this.items[index].showInput = true;
			this.cacheCommentUserId = commentUserId
		},

		// 发送评论
		pushComment(index, itemId){
			// 校验 评论内容
			if(!this.cacheVal){
				this.showPopup('评论内容不能为空')
				return;
			}
			// 此处应为 post 请求
			axios.get('http://localhost/static/json/userInfo.json',{
				'itemId': itemId,					// 作品ID
				'replyUserId': this.cacheCommentUserId,	// 回复用户ID
				'value': this.cacheVal				// 回复内容
			}).then((res)=>{
				if(res.data.status == 200){
					this.items[index].comment.comments.push({
                        "userName": this.userInfo.userName,
                        "userId": this.userInfo.userId,
                        "replyUserId": this.cacheCommentUserId,
                        "replyUserName": this.cacheCommentUserName,
                        "replyContent": this.cacheVal
					})
					this.cacheVal = '';
					this.showPopup('评论成功', 1000)
				}
			})
		},

		// 评分
		pushScore(scoreNum, index){
			this.items[index].score = scoreNum;
			axios.get('http://localhost/static/json/pushScore.json').then((res)=>{
				if(res.data.status == 200){
					this.showPopup('评分成功，你给了'+scoreNum+'颗星~')
				}
			})
		},

		// 提示信息
		showPopup(val, time=2500){
			this.popup = val;
			setTimeout(() => {
				this.popup = null;
			}, time);
		},

		// 下滑懒加载 获取滚动条当前的位置
		getScrollTop () {
			var scrollTop = 0
			if (document.documentElement && document.documentElement.scrollTop) {
				scrollTop = document.documentElement.scrollTop
			} else if (document.body) {
				scrollTop = document.body.scrollTop
			}
			return scrollTop
		},

		// 下滑懒加载 获取当前可视范围的高度
		getClientHeight () {
			var clientHeight = 0
			if (document.body.clientHeight && document.documentElement.clientHeight) {
				clientHeight = Math.min(document.body.clientHeight, document.documentElement.clientHeight)
			} else {
				clientHeight = Math.max(document.body.clientHeight, document.documentElement.clientHeight)
			}
			return clientHeight
		},
  
		// 下滑懒加载 获取文档完整的高度
		getScrollHeight () {
			return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
		},

		// 下滑懒加载 滚动事件触发加载
		onScroll () {
			if (this.getScrollHeight() - this.getClientHeight() - this.getScrollTop() <= 1) {
				// 校验 是否正在加载中
				if(this.isOnLoading)	return;
				else					this.isOnLoading = true;
				
				// 利用 Promise 设置1秒定时器的回调函数
				this.showLoading().then(() => {
					// 获取更多 作品信息
					axios.get('http://localhost/static/json/itemInfo2.json').then((res)=>{
						if(res.data.status == 200){
							// 遍历评论 - 默认隐藏输入框 & 评论大于3条隐藏
							res.data.result.forEach((item)=>{
								if(item.comment.comments.length > 3)	item.showComment = false;
								else									item.showComment = true;
								item.showInput = false;
								this.items.push(item)
							})
							// 关闭 loading & 标记 可获取更多信息
							this.isShowLoading = false;
							this.isOnLoading = false;
							//创建雷达图 
							setTimeout(() => {
								this.items.forEach(i => {
									this.createRadar(i.itemId, i.radar);
								})
							}, 5000);
						}
					})
				  });
			}
		},

		// 下滑懒加载 显示加载中...
		showLoading(){
			this.isShowLoading = true;
			// 获取作品信息
			return new Promise((resolve, reject)=>{
				setTimeout(resolve, 1000);
			})
		}

	}
})