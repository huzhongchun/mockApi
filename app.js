var express = require('express');
var reactViews = require('express-react-views');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', reactViews.createEngine());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res, next) {
  res.render('index', { title:'admin',msg: "Mock服务"});
});

app.get('/api', function (req, res, next) {
  res.render('api_post', { title:'API POST',msg1: "url example: /aa/bb/cc",msg2:"json example: {\"key1\":\"value\",\"key2\":1}"});
});



var url_json_list = {};
var url_list = new Array();

function is_valid_url(url) {
	if(url==null||url=="") return false;
	if(url.indexOf("/")!=0) return false;
	if(url.indexOf(" ")>0) return false;
	let path_arr = url.split("/");
	for(let i=1; i<(path_arr.length-1); i++){
		let item = path_arr[i];
		if(item==null||item=="") return false;
	}
	return true;
}

function is_reserved_url(url){
	return url=="/"||url=="/api"||url=="/api/post"||url=="/api/list";
}

function is_valid_json(data) {
	if(data==null||data=="") return false;
	try{
		JSON.parse(data);
	}catch(e){
		return false;
	}
	return true;
}


let _apiRouterListArray = [];
updateRouterList();

function updateRouterList() {
    fs.readFile(__dirname + '/data/api.txt', {flag: 'r+', encoding: 'utf8'}, function (err, data) {
        if(err) {
            console.error(err);
            return;
        }
        let reg = "\n";
        let apiArray = data.split(reg);
        _apiRouterListArray = apiArray;
        apiArray.map(function(url_path){
            if(url_path)
                app.all(url_path, function(req1,res1){
                    let data = fs.readFileSync(__dirname+url_path+'/data.json');
                    res1.json(JSON.parse(data));
                })
        });
        console.log(apiArray);
    });
}


function appendRouterList(url_path) {
    if(!_apiRouterListArray.includes(url_path))
        fs.appendFileSync(__dirname + '/data/api.txt','\n'+url_path);

}

app.get('/api/list', function (req, res, next) {
  res.render('api_list', { title:'API LIST',json_list: _apiRouterListArray});
});



//创建文件夹
function mkdir(pos, dirArray,_callback){
    var len = dirArray.length;
    if( pos >= len || pos > 10){
        _callback();
        return;
    }
    var currentDir = '';
    for(var i= 0; i <=pos; i++){
        if(i!=0) currentDir+='/';
        currentDir += dirArray[i];
    }
    fs.exists(currentDir,function(exists){
        if(!exists){
            fs.mkdir(currentDir,function(err){
                if(err){
                    console.log('创建文件夹出错！');
                }else{
                    // console.log(currentDir+'文件夹-创建成功！');
                    mkdir(pos+1,dirArray,_callback);
                }
            });
        }else{
            // console.log(currentDir+'文件夹-已存在！');
            mkdir(pos+1,dirArray,_callback);
        }
    });
}


//创建目录结构
function mkdirs(dirpath,_callback) {
    let dirArray = dirpath.replace(/^\//,'').split('/');
    console.log(dirArray);
    fs.exists( dirpath ,function(exists){
        if(!exists){
            mkdir(0, dirArray,function(){
                // console.log('文件夹创建完毕!准备写入文件!');
                _callback();
            });
        }else{
            // console.log('文件夹已经存在!准备写入文件!');
            _callback();
        }
    });
}


app.post('/api/post', function(req, res, next){
	if(req.body.url_path==null||req.body.json_text==null){
		res.render('api_tips', { title:'TIPS',msg: "url and json can not be null"});
		return
	};


	let url_path = req.body.url_path.trim().toLowerCase();
	let json_text = req.body.json_text.trim();

	// if(!is_valid_url(url_path)){
	// 	res.render('api_tips', { title:'TIPS',msg: "error url!\nurl: "+url_path});
	// 	return
	// }

	if(is_reserved_url(url_path)){
		res.render('api_tips', { title:'TIPS',msg: "url is reserved! url cannot be [/, /api, /api/post, /api/list]"});
		return
	}

	if(!is_valid_json(json_text)){
		res.render('api_tips', { title:'TIPS',msg: "error json!\njson: "+json_text});
		return
	}

	// if(url_path in url_json_list){
	// 	url_json_list[url_path]=json_text;
	// 	//TODO UPDATE FILE
    //
	// }else{
	// 	let jsonStr = JSON.stringify(JSON.parse(json_text));
	// 	url_json_list[url_path]=jsonStr;
	// 	url_list.push(url_path);
	// 	fs.appendFile(__dirname + '/data/api.txt', "END\n"+url_path+" "+jsonStr, function () {
	// 	  	console.log('add success:'+req.body.url_path);
	// 	});
	// 	app.all(url_path, function(req1,res1){
	// 		res1.json(JSON.parse(url_json_list[url_path]));
	// 	})
	// }
    // res.render('api_tips', { title:'TIPS',msg: "add success!", url:url_path});

    url_path = '/api/'+url_path; //默认都创建在api文件夹下面
    mkdirs(url_path,()=>{
        fs.writeFile(url_path.replace(/^\//,'')+'/data.json',json_text);
        res.render('api_tips', { title:'TIPS',msg: "add success!", url:url_path});
        app.all(url_path, function(req1,res1){
            let data = fs.readFileSync(__dirname+url_path+'/data.json');
            res1.json(JSON.parse(data));
        });
        appendRouterList(url_path);
    });
	
});

let server = app.listen(3000, function () {
  console.log('app listening at post 3000');
});