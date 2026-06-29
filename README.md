# 🥃 Cocktail Library

一个轻量、纯前端的鸡尾酒配方管理工具，适合喜欢调酒、想要整理个人配方的用户使用。

本项目完全在浏览器中运行，无需后端、无需数据库，所有用户数据均通过 `localStorage` 保存在本地设备中。

---

## ⭐️ 功能特点

- **添加自定义鸡尾酒配方**  
  在浏览器中直接创建并保存属于你的配方。

- **编辑与删除配方**  
  完整的配方管理能力，让你的鸡尾酒资料库保持整洁。

- **内置少量默认示例**  
  初次使用时会自动加载几个经典鸡尾酒作为示例。

- **localStorage 持久化存储**  
  刷新页面、关闭浏览器后数据仍然保留，除非你手动清除浏览器存储。

- **材料别名系统**  
  支持为材料添加别名，方便搜索与整理。

- **个人"酒柜"功能**  
  记录你当前拥有的酒类与材料。

- **纯前端、无需安装**  
  无需服务器即可运行，可部署在任何静态托管平台。

---

## 📦 工作原理

Cocktail Library 完全由以下技术构成：

- HTML
- CSS
- JavaScript

页面加载时：

1. 检查 `localStorage` 是否已有用户数据
2. 若无，则写入默认示例配方
3. 用户新增或修改的内容会实时保存到 `localStorage`
4. 数据会一直保留，直到用户手动清除浏览器存储

> ⚠️ 由于使用了 ES Modules，**不能**直接双击打开 `index.html` 运行，必须通过本地服务器或使用线上 Demo。

---

## 🚀 在线体验

你可以直接访问线上版本：

🔗 [https://yqxp.github.io/Cocktail_Library](https://yqxp.github.io/Cocktail_Library)

无需安装、无需配置。

---

## 🛠 本地运行方式

由于项目使用了 ES Modules，必须通过本地服务器运行。

### 方法一：VS Code Live Server

1. 安装 Live Server 插件
2. 右键 `index.html` → "Open with Live Server"

### 方法二：Python 本地服务器

```bash
py -3 -m http.server 8080
```

然后访问：

```
http://localhost:8080
```

---

## 🔒 数据存储说明

所有用户数据均存储在浏览器的 `localStorage` 中。

要重置应用，只需清除浏览器的 `localStorage`。

---

## 🇬🇧 English Version

A lightweight, browser-based cocktail recipe manager designed for people who enjoy mixology and want a simple way to organize their own recipes.

This project is a pure front-end web application — no backend, no database, no server required. All user data is stored locally using `localStorage`, making it fast, private, and easy to use.

### ⭐️ Features

- **Add your own cocktail recipes**  
  Create and save custom recipes directly in your browser.

- **Edit or delete existing recipes**  
  Full control over your personal cocktail collection.

- **Default example cocktails included**  
  A few classic recipes are provided as initial examples.

- **localStorage-based data persistence**  
  Your recipes stay saved even after refreshing or closing the browser.

- **Ingredient alias system**  
  Manage alternative ingredient names for easier searching.

- **Personal "Liquor Cabinet"**  
  Track what bottles you currently have at home.

- **No installation required**  
  Runs entirely in the browser and can be hosted anywhere.

### 📦 How It Works

This project is built entirely with:

- HTML
- CSS
- JavaScript

On page load:

1. The app checks whether `localStorage` already contains user data
2. If not, it loads a set of default example recipes
3. Any new recipes you create are saved to `localStorage`
4. Your data remains available until you manually clear your browser storage

> ⚠️ Because the project uses ES Modules, you **cannot** run it by opening `index.html` directly. You must use a local server or the Live Demo.

### 🚀 Live Demo

Try the hosted version here:

🔗 [https://yqxp.github.io/Cocktail_Library](https://yqxp.github.io/Cocktail_Library)

No installation required.

### 🛠 Local Development

Since ES Modules require a proper origin, you must run the project using a local server.

**Option 1: VS Code Live Server**

1. Install the Live Server extension
2. Right-click `index.html` → "Open with Live Server"

**Option 2: Python local server**

```bash
py -3 -m http.server 8080
```

Then open:

```
http://localhost:8080
```

### 🔒 Data Storage

All user-generated content is stored in `localStorage`.

To reset the app, simply clear your browser's `localStorage`.
