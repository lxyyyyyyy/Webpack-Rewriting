const Compiler = require('./Compiler')
//定义myWebpack函数并且暴露
function myWebpack(config){
    return new Compiler(config)
}

module.exports = myWebpack;