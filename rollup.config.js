import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

export default [
  {
    // 入口文件
    input: 'packages/vue/src/index.ts',
    // 出口文件
    output: [
      {
        sourcemap: true,
        // 导出文件地址
        file: './packages/vue/dist/vue.js',
        // 导出格式
        format: 'iife',
        // 导出名称
        name: 'Vue'
        // 全局变量
        // globals: {
        //   '@vue/compiler-sfc': 'VueCompilerSFC'
        // }
      }
    ],
    // 插件
    plugins: [
      // 解析第三方依赖
      resolve(),
      // 解析commonjs
      commonjs(),
      // 解析typescript
      typescript({
        sourceMap: true
      })
    ]
  }
]
