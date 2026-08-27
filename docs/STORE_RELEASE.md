# Chrome Web Store 重新上架说明

## 旧条目为什么显示 “This item is not available”

公开页面只给出通用的“不可用”提示，**仅凭这个页面无法确定具体下架原因**。准确原因只能在原开发者账号的 Chrome Web Store Developer Dashboard、Google 发出的下架邮件或申诉记录中确认。

但仓库历史提供了一个很强的线索：2019 年实际发布的清单是 Manifest V2；2024 年虽然把源码中的清单改成了 V3，却没有证据表明这个版本曾上传到商店。Google 已完成 Manifest V2 淘汰：2025 年 7 月 Chrome 138 对所有用户禁用 V2，官方时间线也明确写明剩余 V2 条目会从 Chrome Web Store 移除。因此，本项目最可能是随 Manifest V2 淘汰而失效，而不是目前能从公开页面确认的某一项违规处罚。

参考：

- [Manifest V2 support timeline](https://developer.chrome.com/docs/extensions/develop/migrate/mv2-deprecation-timeline)
- [Chrome Web Store Program Policies](https://developer.chrome.com/docs/webstore/program-policies/policies)
- [Additional Requirements for Manifest V3](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements)
- [Listing Requirements](https://developer.chrome.com/docs/webstore/program-policies/listing-requirements)

## 这次重写如何降低审核风险

- 使用 Manifest V3 service worker。
- 单一用途明确：只在用户要求时显示字幕遮罩。
- 删除 `<all_urls>` 和 `host_permissions`，不再常驻访问所有网站。
- 删除未使用的弹窗、React、Ant Design、字体和公开资源。
- 所有运行代码随 zip 提交，不使用远程代码、`eval` 或外部脚本。
- 只保存位置和尺寸，不读取或传输网页内容。
- 商店上传包的根目录直接包含 `manifest.json`。

## 商店文案草案

### 名称

Caption Mask

### 一句话说明

用可拖动、可缩放的遮罩挡住视频字幕，专注进行无字幕听力练习。

### 详细说明

Caption Mask 为网页视频添加一块简单的字幕遮罩，帮助语言学习者进行无字幕听力练习。

使用方法：

1. 打开播放视频的网页。
2. 点击 Caption Mask 图标，或按 `Alt+M`，显示遮罩。
3. 拖动遮罩调整位置；拖动右下角调整大小。
4. 鼠标移入遮罩时，遮罩会暂时变透明，便于核对字幕。
5. 再次点击图标或按 `Alt+M` 隐藏遮罩。

扩展会在本机记住上次的位置和尺寸，并支持常见网页播放器的全屏模式。它不收集或上传网页内容及浏览数据。

### 类别建议

Education

## Dashboard 隐私与权限填写建议

### Single purpose

在当前网页上显示一块可移动、可缩放的遮罩，用于挡住视频字幕并进行听力练习。

### Permission justifications

- `activeTab`：用户点击扩展图标或按快捷键后，临时允许扩展在当前标签页显示字幕遮罩；扩展不请求任何网站的常驻访问权限。
- `scripting`：将扩展包内的 `content.js` 注入用户主动选择的当前标签页，以创建、移动、缩放或移除字幕遮罩。
- `storage`：只在本机保存遮罩的 `top`、`left`、`width`、`height`，以便下次恢复。

### Remote code

No. 扩展的全部 JavaScript 都包含在提交的安装包中，不下载或执行远程代码。

### Data use

建议按实际行为声明“不收集用户数据”。扩展只在设备本地保存 UI 设置，不传输网页内容、浏览历史或个人信息。隐私政策 URL 可使用仓库公开后的：

`https://github.com/chess99/caption-mask/blob/master/docs/PRIVACY.md`

## 发布前检查清单

1. 登录原开发者账号，先查看旧条目 `epdjagabjcjgohepebikdkcdpfoennec` 的状态和历史通知。
2. 如果 Dashboard 允许提交更新，优先复用旧条目，以保留原 ID 和历史用户；如果显示永久移除且不允许更新，再创建新条目。
3. 运行 `pnpm verify`，上传 `dist-pack/caption-mask-1.0.0.zip`。
4. 准备至少一张真实功能截图。当前商店接受的常用尺寸是 1280×800 或 640×400；截图应显示网页视频、遮罩和右下角缩放柄，不要伪造浏览器或用户评价。
5. 使用已有的 128×128 图标；提交前人工检查它在浅色和深色背景下的可辨识度。
6. 填写上面的单一用途、权限理由、远程代码和数据使用说明。
7. 填写公开隐私政策 URL，确认文案、Dashboard 隐私字段和扩展实际行为完全一致。
8. 在全新 Chrome 配置中加载 `dist`，至少检查普通网页、一个视频站点、网页全屏、刷新后恢复位置、`Alt+M` 和卸载重装。
9. 注意 `chrome://`、Chrome Web Store 和其他扩展页面禁止注入，不要把它们当作故障截图提交。

代码包已经可生成，但真正提交商店仍需要原开发者账号、商店素材和 Dashboard 中的人工确认。
