const { getAst, getDeps, getCode } = require('./parser')
const path = require('path');
const fs = require('fs')

class Compiler {
    constructor(options = {}) {
        //将options放在this中，就可以通过this访问options
        this.options = options;
        //所有依赖容器
        this.modules = [];

    }
    //compiler中的钩子函数
    //run()启动webpack打包
    run() {
        //读取入口文件
        const filePath = this.options.entry
        //第一次构建，添加入口文件信息
        const fileInfo = this.build(filePath);
        this.modules.push(fileInfo);

        //遍历所有依赖，不断递归里面依赖的依赖
        this.modules.forEach((fileInfo)=>{
            //取出当前文件的所有依赖
            const deps = fileInfo.deps
            //遍历
            for(const relativePath in deps){
                const absolutePath = deps[relativePath];
                const fileInfo = this.build(absolutePath);
                this.modules.push(fileInfo);
            }
        })
        // console.log(this.modules)
        //将依赖生成依赖关系图
        const depsGragh = this.modules.reduce((gragh,module)=>{
            return{
                ...gragh,
                [module.filePath]:{
                    code:module.code,
                    deps:module.deps
                }
            }
        },{})
        // console.log(depsGragh)
        this.generate(depsGragh);

    }
    //开始构建依赖
    build(filePath) {
        const ast = getAst(filePath);
        //获取所有依赖
        const deps = getDeps(ast, filePath);

        const code = getCode(ast);
        return{
            filePath,
            deps,
            code
        }
    }

    //生成输出资源
    generate(depsGragh){
        const bundle = `
        (function (depsGragh){
            function require(module){
                function localRequire(relativePath) {
                    return require(depsGragh[module].deps[relativePath])
                }
                var exports = {};
                (function(require,exports,code){
                    eval(code)
                })(localRequire,exports,depsGragh[module].code);
                return exports
            }
            //加载入口文件
            require('${this.options.entry}')
        })(${JSON.stringify(depsGragh)})
        `
        const filePath = path.resolve(this.options.output.path,this.options.output.filename)
        fs.writeFileSync(filePath,bundle,'utf-8')
    }
    
}
module.exports = Compiler;