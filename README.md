# caption-mask

## 说明

插件相关的文件都在src下

```bash
src
├─manifest.json
├─icons
├─background
├─content
├─inject
├─popup
└─devtool
```

manifest.json中的version在build时自动从package.json中获取

## 命令

```bash

# 生成所有文件到dist
npm run buld
# or
gulp build

# build到dist且打包成zip到dist-pack
npm run buildPack
# or
gulp buildPack
# or
gulp

# 删除所有生成的文件, 包括dist和dist-pack
gulp clean

```
