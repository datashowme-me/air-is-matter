# 🚀 快速开始 - 新功能使用指南

## 新增功能概览

### 1. 📚 新用户引导 (Onboarding)

三步互动式教程，帮助新用户快速了解如何使用 Air is Matter。

### 2. ✨ UI 优化

更精致的界面设计，更好的用户体验。

---

## 如何测试新功能

### 测试 Onboarding

#### 方法 1: 模拟首次访问

在浏览器控制台中运行：

```javascript
// 清除已查看标记
localStorage.removeItem('hasSeenOnboarding')

// 刷新页面
location.reload()
```

#### 方法 2: 点击帮助按钮

页面右下角有一个橙色的圆形按钮"How it works"，点击即可随时查看引导。

---

## 新功能详解

### Onboarding 引导流程

#### Step 1: 获取你的专属 URL
- 学习如何搜索城市
- 了解 webcal 链接的作用
- 查看复制链接的方法

#### Step 2: 添加到日历
- **Google Calendar**: 3步详细说明
  1. 点击"Other calendars"旁的 + 号
  2. 选择"From URL"
  3. 粘贴 URL 并添加

- **Apple Calendar**: 3步详细说明
  1. 打开 Calendar app，点击 File 菜单
  2. 选择"New Calendar Subscription..."
  3. 粘贴 URL 并订阅

#### Step 3: 完成！
- 查看日历中的效果预览
- 了解 emoji 表情的含义
- 开始使用应用

### UI 改进

1. **城市搜索框**
   - 添加地图图标提示
   - Hover 效果更流畅
   - 阴影效果更精致

2. **订阅 URL 区域**
   - 蓝色提示框，说明如何使用
   - 改进的复制按钮，带图标
   - 复制成功后显示"Copied!"反馈

3. **帮助按钮**
   - 固定在右下角
   - 响应式设计，移动端自动调整
   - 随时可以查看教程

---

## 开发和部署

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 访问
# http://localhost:5173
```

### 构建生产版本

```bash
# 构建
npm run build

# 预览构建结果
npm run preview
```

### 部署到 Cloudflare Pages

```bash
# 构建并部署（如果使用 Wrangler）
npm run build
# 然后通过 Cloudflare Pages 控制台部署 dist/ 目录
```

---

## 常见问题

### Q: Onboarding 不弹出？
**A:** 检查 localStorage 中是否有 `hasSeenOnboarding` 标记。清除后刷新页面即可。

### Q: 如何禁用 Onboarding？
**A:** 在 `App.tsx` 中修改：
```typescript
// 注释掉这段代码
// useEffect(() => {
//   const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
//   if (!hasSeenOnboarding) {
//     setIsOnboardingOpen(true);
//   }
// }, []);
```

### Q: 如何自定义 Onboarding 内容？
**A:** 编辑 `components/Onboarding.tsx`，修改每个步骤的文字和布局。

### Q: 帮助按钮位置可以调整吗？
**A:** 可以！在 `App.tsx` 中找到帮助按钮，修改 className 中的 `bottom-6 right-6` 值。

---

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ 移动端浏览器（iOS Safari, Chrome Mobile）

---

## 技术栈

- **框架**: React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **图表**: Recharts
- **部署**: Cloudflare Pages

---

## 反馈和支持

如果遇到问题或有改进建议，请：
1. 查看 [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md) 了解完整技术细节
2. 检查浏览器控制台是否有错误信息
3. 确认所有依赖都已正确安装

---

*祝使用愉快！🎉*
