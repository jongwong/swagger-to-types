# swagger-to-types README

将 Swagger JSON 导出为 Typescript interface

每个接口生成一个 `namespace` (用于分组,避免重名), 包含 `Params`, `Response`, 和一些额外 `interface`.

## 预览

![img](./assets/images/preview.png)

## Config

| 名称 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| swaggerToTypes.swaggerJsonUrl | Swagger API 列表 | [SwaggerJsonUrlItem](#SwaggerJsonUrlItem)[] | [] |
| swaggerToTypes.savePath | `.d.ts` 接口文件保存路径 | string | 'types/swagger-interfaces' |
| swaggerToTypes.showStatusbarItem | 显示状态栏按钮 | boolean | `true` |
| swaggerToTypes.compareChanges | 是否在更新接口时比对更改 (无更改不更新) | boolean | `true` |
| swaggerToTypes.reloadWhenSettingsChanged | 当用户设置更改时重新加载数据. (在某些频繁刷新设置的情况下需要关闭) | boolean | `true` |
| swaggerToTypes.ignorePath | 生成命名控件规则需要或略的url前缀，第一个符合的url |string 或 string[] | [] |
| swaggerToTypes.propertiesCase | 字段名格式风格,小驼峰 | 下横线 |  'camel' 或 'under' | under |
## SwaggerJsonUrlItem

| 属性     | 说明                 | 类型   | 是否必填 |
| -------- | -------------------- | ------ | -------- |
| title    | 项目标题             | string | \*       |
| url      | swagger json url     | string | \*       |
| link     | 在浏览器打开外部链接 | string |          |
| basePath | basePath             | string |          |

## 快捷键

- 搜索接口列表: <kbd>alt</kbd> + <kbd>shift</kbd> + <kbd>F</kbd>

## 忽略一键更新

在 `.d.ts` 文件头部注释中添加 `@ignore` 标识, 可以在一键更新本地接口时忽略当前文件.

```ts
/**
 * @name   示例接口
 * @path   /demo/demo-api
 * @method POST
 * @update 10/19/2020, 11:22:53 AM
 * @ignore
 */
```

## 源代码相关

开发预览调试：在 vscode 中按下 <kbd>F5</kbd> 即可。

## 注意

- 支持 swagger v2 API
- 支持 openapi 3.0.0 (1.1.4 新增)
## 配置demo
``` "swaggerToTypes":{
    "swaggerJsonUrl":[
      {
        "title": "admin",
        "url": "http://jongwong/v2/api-docs"
    },
     
    ],
    "ignorePath": ["/admin"],
    "propertiesCase": "under"
  }
```
