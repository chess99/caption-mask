# Caption Mask

Caption Mask 是一个用于外语听力练习的 Chrome 扩展。它在当前网页上放置一块可拖动、可缩放的遮罩，临时挡住视频字幕；鼠标移入遮罩时会变透明，便于随时核对字幕。

## 功能

- 点击扩展图标显示或隐藏遮罩
- 使用 `Alt+K` 显示或隐藏遮罩
- 拖动遮罩改变位置，拖动右下角改变尺寸
- 自动记住上次的位置与尺寸
- 进入或退出网页全屏时自动移动遮罩
- 自动限制遮罩范围，避免拖出屏幕后无法找回

## 权限说明

扩展不申请任何网站的常驻访问权限，只使用三个 Chrome 权限：

- `activeTab`：仅在用户点击扩展图标或按快捷键后，临时访问当前标签页。
- `scripting`：把随扩展打包的遮罩代码注入当前标签页。
- `storage`：在本机保存遮罩的位置与尺寸。

扩展不收集、不上传、不出售任何数据，也不加载远程代码。完整说明见[隐私政策](docs/PRIVACY.md)。

## 本地开发

要求 Node.js 20+ 和 pnpm。

```bash
pnpm install
pnpm verify
```

常用命令：

```bash
pnpm build        # 生成 dist/
pnpm build:pack   # 生成商店上传用 zip
pnpm test         # 运行位置和尺寸计算测试
pnpm typecheck    # TypeScript 类型检查
pnpm clean        # 删除构建产物
```

在 `chrome://extensions` 打开“开发者模式”，选择“加载已解压的扩展程序”，然后选中 `dist` 目录即可本地试用。Chrome 内部页面、Chrome 应用商店页面和其他扩展页面不允许扩展注入，这是浏览器本身的限制。

## 发布

商店文案、权限说明、隐私披露和发布检查清单见[重新上架说明](docs/STORE_RELEASE.md)。历史想法及取舍见[路线图](TODO.md)。

## 项目结构

```text
src/
├── background.ts      # 响应图标与快捷键，注入遮罩
├── content.ts         # 遮罩 UI、拖动、缩放、全屏与持久化
├── geometry.ts        # 可测试的位置和尺寸计算
├── icons/
└── manifest.json
scripts/               # 构建与打包
tests/                 # 单元测试
docs/                  # 发布与隐私文档
```

## License

[MIT](LICENSE)
