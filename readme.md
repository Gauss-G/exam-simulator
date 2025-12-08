# 模拟考试系统

一个基于 Vue 3 + Vite + Element Plus 的纯前端模拟考试系统，支持模拟考试、练习模式和错题集功能。

## ✨ 功能特点

### 📝 模拟考试
- ⏱️ 90分钟计时考试
- 📊 题目组成：
  * 判断题 40 道（每题 0.5 分）
  * 选择题 140 道（每题 0.5 分）
  * 多选题 10 道（每题 1 分）
- 🎲 题目从题库中随机抽取
- 📋 答题卡实时显示答题进度
- ✅ 完成后显示成绩和详细答案解析
- ⚠️ 倒计时结束自动提交

### 🎯 练习模式
- 🔖 自由选择题型（判断题/单选题/多选题）
- 🔢 自定义练习题目数量
- 📈 实时显示练习进度
- 🌟 连续答对5次以上自动标记为已掌握
- 💾 学习数据持久化存储（LocalStorage）

### ❌ 错题集
- 📚 自动收集错题
- 🔍 按题型筛选错题
- 🎓 可重新练习错题
- ✔️ 答对后自动从错题集移除
- 🗑️ 支持单个移除或清空错题集

### 📊 学习统计
- 已掌握题目数量
- 错题数量统计
- 题库总数展示

## 🗂️ 题库结构

题库位于 `questions/` 目录，包含三个 JSON 文件：

- `questions_bool.json` - 判断题
- `questions_choose.json` - 单选题  
- `questions_multi.json` - 多选题

### 判断题格式
```json
{
  "index": "1",
  "content": "题目内容",
  "result": "正确"
}
```

### 单选题格式
```json
{
  "index": 1,
  "content": "题目内容",
  "result": "C",
  "options": [
    {"key": "A", "value": "选项A"},
    {"key": "B", "value": "选项B"},
    {"key": "C", "value": "选项C"},
    {"key": "D", "value": "选项D"}
  ]
}
```

### 多选题格式
```json
{
  "index": 1,
  "content": "题目内容",
  "result": "ABC",
  "options": [
    {"key": "A", "value": "选项A"},
    {"key": "B", "value": "选项B"},
    {"key": "C", "value": "选项C"},
    {"key": "D", "value": "选项D"},
    {"key": "E", "value": "选项E"}
  ]
}
```

## 🛠️ 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **路由**: Vue Router 4
- **图标**: Element Plus Icons
- **数据存储**: LocalStorage

## 📦 项目结构

```
exam-simulation/
├── public/              # 静态资源
├── questions/           # 题库文件
│   ├── questions_bool.json
│   ├── questions_choose.json
│   └── questions_multi.json
├── src/
│   ├── views/          # 页面组件
│   │   ├── Home.vue
│   │   ├── Exam.vue
│   │   ├── Practice.vue
│   │   └── WrongQuestions.vue
│   ├── router/         # 路由配置
│   │   └── index.js
│   ├── utils/          # 工具函数
│   │   ├── questions.js    # 题目管理
│   │   └── storage.js      # LocalStorage封装
│   ├── App.vue         # 根组件
│   ├── main.js         # 入口文件
│   └── style.css       # 全局样式
├── index.html
├── vite.config.js
├── package.json
└── readme.md
```

## 🚀 快速开始

### 环境要求
- Node.js 14+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/Gauss-G/exam-simulator.git
   cd exam-simulator
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   
   打开浏览器访问 `http://localhost:3000`

### 构建生产版本

```bash
npm run build
```

构建后的文件将输出到 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

## 💾 数据存储

系统使用 LocalStorage 存储以下数据：

- `mastered_questions`: 已掌握的题目列表
- `wrong_questions`: 错题集
- `question_stats`: 题目答题统计

所有数据在浏览器本地持久化，刷新页面后依然可用。

## 🎨 界面预览

### 首页
- 显示三大功能模块入口
- 展示学习统计数据

### 模拟考试
- 倒计时显示
- 实时答题卡
- 题目导航
- 成绩和答案解析

### 练习模式
- 题型和数量选择
- 进度条显示
- 已掌握题目统计

### 错题集
- 错题列表展示
- 题型筛选
- 错题练习
- 清空和移除功能

## 📝 使用说明

1. **开始模拟考试**：点击"模拟考试"，系统将随机抽取190道题目，开始90分钟倒计时
2. **练习模式**：选择题型和数量，进行针对性练习
3. **查看错题集**：查看和练习之前答错的题目
4. **学习统计**：首页查看学习进度和掌握情况

## 🔧 开发说明

### 添加题目
在 `questions/` 目录下的对应 JSON 文件中添加题目即可。

### 修改考试规则
在 `src/utils/questions.js` 中的 `generateExamQuestions` 函数中修改题目数量和分值。

### 自定义样式
修改各组件的 `<style scoped>` 部分或 `src/style.css` 全局样式。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 部署

构建后的静态文件可以部署到任何静态服务器，如：
- GitHub Pages
- Vercel
- Netlify
- 阿里云 OSS
- 腾讯云 COS