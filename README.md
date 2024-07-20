# caption-mask

## 说明

插件相关的文件都在 src 下

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

manifest.json 中的 version 在 build 时自动从 package.json 中获取

## 命令

```bash

# 生成所有文件到dist
pnpm build

# build到dist且打包成zip到dist-pack
pnpm buildPack

# 删除所有生成的文件, 包括dist和dist-pack
pnpm clean
```
