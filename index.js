var fs = require('fs');
var batText = '';
//var cp = require('child_process');

//输入公式的文本框
var e_textarea = document.getElementById("text"),
	e_alert = document.getElementById('alert'),
	e_input = document.querySelectorAll('input');

//自定义生成公式
var curr = true;
document.getElementById('custom').onclick = function(){
	if(curr){
		this.innerHTML = '直接输入ID';
		e_textarea.style.display = 'block';
		e_input[0].parentNode.style.display = 'none';
		e_input[1].parentNode.style.display = 'none';
		curr =false;
	}else{
		this.innerHTML = '自定义生成公式';
		e_input[0].parentNode.style.display = 'table';
		e_input[1].parentNode.style.display = 'table';
		e_textarea.style.display = 'none';
		curr =true;
	}
};

document.getElementById('start').onclick = function(){
	//将文本框里的公式转化为可执行的js代码
	if(curr){
		var fn = '';
	    for(var i=e_input[0].value;i<=e_input[1].value;i++)
	    fn+='http://dk.zgics.com/p.php/d/'+i+',';
	}else{
		var fn = eval('__RESULT__ = '+e_textarea.value).toString();
	}
	var value = fn.replace(/,$/,'').split(',');
	var that = this;
	that.innerHTML = '请稍候';
	that.className+=' disabled';

	//历遍每一个值，使之变为二维码
	value.forEach(function(item){
		var div = document.createElement('div');
		div.style.cssText = 'float:left;width:50px;margin-right:10px;margin-bottom:10px;display:none;';
		document.body.appendChild(div);
		var qrcode = new QRCode(div,{
			width : 550,
			height : 550
		});
		qrcode.makeCode(item);
	});
	var imgs = document.querySelectorAll('img'),
		imgsLength = imgs.length;
	
	//将二维码添加到canvas中
	//各二维码在模板上的坐标 8 个一版
	var XandY = [
		{x:620,y:290},
		{x:1767,y:290},
		{x:620,y:1094},
		{x:1767,y:1094},
		{x:620,y:1893},
		{x:1767,y:1893},
		{x:620,y:2708},
		{x:1767,y:2708},
	];
	
	//将画布保存为本地图片
	window.menu = ~~(new Date().getTime()/1000);//获取当前时间戳作为文件夹的名字
	menu = 'qrcode'+menu;
	fs.mkdir('C:/Users/Administrator/Desktop/'+menu,function(err){
		if(err)return;
		drawAndSave();
	});
	
	function drawAndSave(page){
		if(page>imgsLength){
			var body = document.body;
			[].forEach.call(imgs,function(item){
				body.removeChild(item.parentNode);
			});
			
			//生成完毕
			fs.writeFile('C:/Users/Administrator/Desktop/'+menu+'/点击转化为CMYK.bat',batText,function(err){
//				cp.execFile('C:/Users/Administrator/Desktop/'+menu+'/点击转化为CMYK.bat',[],{
//					cwd:'C:/Users/Administrator/Desktop/'+menu
//				},function(err, stdout, stderr){
//					if(err){
//						console.log(err);
//					}
//				});
				that.innerHTML = '生成二维码';
				that.className = that.className.replace(/ disabled/,'');
			});
			
			return;
		}
		var thisPage = page||8;
		var canvas = document.createElement('canvas');
		var cxt = canvas.getContext('2d');
		canvas.width = 2482;
		canvas.height = 3508;
		var img = document.createElement('img');
		img.src = './img/ercode('+(thisPage-7)+'-'+thisPage+').png';
		
		imgIsReady();
		function imgIsReady(){
			if(img.width){
				cxt.drawImage(img,0,0,img.width,img.height);
				drawErCode(thisPage);
			}else{
				setTimeout(imgIsReady,100);
			}
		}
		
		function drawErCode(len){
			[].forEach.call(imgs,function(item,index){
				if(index>=len-8 && index<len)
				cxt.drawImage(
					item,0,0,
					item.width,item.height,
					XandY[index%8].x,XandY[index%8].y,
					486,486
				);
			});
			saveErcode();
		}
		
		function saveErcode(){
			var url = 'C:/Users/Administrator/Desktop/'+menu+'/'+'ercode('+(thisPage-7)+'-'+thisPage+')'+'.jpg';
			fs.writeFile(
				url,
				canvas.toDataURL('image/jpeg',1).split(',')[1],
				'base64',
				function(err){
					batText += 'gm "convert" "'+url+'" "-quality" "100" "-colorspace" "CMYK" "'+url+'"&&';
					canvas = null;
					img = null;
					//递归
					thisPage += 8;
					drawAndSave(thisPage);
				}
			);
		}
	}
};
//向主进程发送关闭通知
var ipcRenderer = require('electron').ipcRenderer;
document.getElementById('close').addEventListener('click', function () {
	console.log(111);
    ipcRenderer.send('close-main-window');
});