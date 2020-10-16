# swagger-to-types README

将 Swagger JSON 导出为 Typescript interface

## Config

| 名称                                     | 说明                                                               | 类型                                         | 默认                     |
| ---------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------- | ------------------------ |
| swaggerToTypes.swaggerJsonUrl            | Swagger API 列表                                                   | [SwaggerJsonUrlItem](##SwaggerJsonUrlItem)[] | []                       |
| swaggerToTypes.savePath                  | `.d.ts` 接口文件保存路径                                           | string                                       | 'types/swagger-to-types' |
| swaggerToTypes.showStatusbarItem         | 显示状态栏按钮                                                     | boolean                                      | `true`                   |
| swaggerToTypes.reloadWhenSettingsChanged | 当用户设置更改时重新加载数据. (在某些频繁刷新设置的情况下需要关闭) | boolean                                      | `true`                   |

## SwaggerJsonUrlItem

| 名称  | 说明                 | 类型   | 必填    |
| ----- | -------------------- | ------ | ------- |
| title | 项目标题             | string | `true`  |
| url   | swagger json url     | string | `true`  |
| link  | 在浏览器打开外部链接 | string | `false` |



## 注意

- 仅支持 swagger v2 API