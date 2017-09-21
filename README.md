# 参考heimashi同学的[easy_mock_api](https://github.com/heimashi/easy_mock_api)



用nodejs（express+react）搭建的极简的服务器，给定一个url就返回一个特定的Json数据，提供给客户端开发同学用的模拟Json服务器接口的项目，项目尽可能的简单，核心代码只有100多行，简单而实用，方便扩展。

## 使用场景
* 当与服务端同学约定好Json接口的格式后，客户端同学运用这个工具配置好对应的路由url和json返回值，连接这个测试的ip地址对应的url就可以去开发业务了，好处是开发环节不会block，不用等服务端同学部署好了接口后才能去开发，提高开发效率和节奏
* 开发中一个接口可能有好几种返回值，对应不同的case，怎样才能测试到所有的case呢？可以用这个工具配置好每个case的返回值json，快速测试好所有case

## 安装方法
* git clone git@github.com:heimashi/easy_mock_api.git
* npm install
* npm start  
  Done! 访问 http://localhost:3000
 
* 如果在生产环境中部署应用，可以采用[forever](https://github.com/foreverjs/forever)工具,步骤是：
  * git clone git@github.com:heimashi/easy_mock_api.git
  * npm install
  * npm install forever -g
  * forever start app.js

## 配置相关
* 配置端口号 项目默认是3000端口，如想配置成其他端口号请修改app.js里的倒数第三行 app.listen(3000, function ()...

## 改动
* api数据存储在对应path路径的文件下，统一文件名为data.json
* api.txt仅存储api的path列表
