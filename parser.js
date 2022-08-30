const fs = require('fs');
const babelParse = require('@babel/parser')
const traverse = require("@babel/traverse").default;
const path = require('path')
const { transformFromAst } = require('@babel/core');
const parser = {
    //将文件解析成抽象语法树
    getAst(filePath) {
        const file = fs.readFileSync(filePath, 'utf-8');
        //将其解析成ast抽象语法树 
        const ast = babelParse.parse(file, {
            sourceType: 'module'
        })
        return ast;
    },
    //获取依赖
    getDeps(ast, filePath) {
        //获取文件夹路径
        const dirname = path.dirname(filePath);
        //定义存储依赖的容器
        const deps = {}
        //收集依赖
        traverse(ast, {
            ImportDeclaration({ node }) {
                const relativePath = node.source.value;
                const absolutePath = path.resolve(dirname, relativePath)
                //添加依赖
                deps[relativePath] = absolutePath;
            }
        })
        return deps
    },
    //将ast解析code
    getCode(ast) {
        const { code } = transformFromAst(ast, null, {
            presets: ['@babel/preset-env']
        })
        return code;
    }

}

module.exports = parser