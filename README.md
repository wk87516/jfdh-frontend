# 若依积分管理系统 - 前端

基于 RuoYi-Vue3 + Element Plus 开发的积分管理系统前端应用。

## 系统简介

若依积分管理系统是一套完整的医院积分管理解决方案，支持以下核心功能：

### 核心功能

- **积分账户管理**：患者积分账户的创建、查询、冻结等操作
- **积分获取**：挂号积分、缴费积分（普通科室/特殊科室）、退费积分扣除
- **积分兑换**：多种兑换项目（挂号费、检查、药品、体检套餐等）
- **HIS系统对接**：与HIS系统深度集成，支持待缴费项目积分兑换
- **公卫系统对接**：家庭医生签约、服务包购买积分获取

## 开发

```bash
# 克隆项目
git clone https://gitee.com/y_project/RuoYi-Vue

# 进入前端目录
cd ruoyi-ui

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npmmirror.com

# 启动服务
npm run dev
```

浏览器访问 http://localhost:80

## 发布

```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```

---

## 积分兑换模块

### 功能特性

- 支持就诊流水号(GHLSH)查询待缴费项目
- 自动匹配可兑换项目
- 实时显示患者积分余额
- 批量积分兑换
- 自动调用HIS收费接口
- 完整的事务管理和日志记录

### HIS兑换页面

访问方式：
- 独立页面（适合HIS系统集成）：`http://localhost:81/#/his-exchange`
- 管理后台页面：`http://localhost:81/points/his-exchange`

### 数据流转

```
用户输入GHLSH
  ↓
查询HIS视图（切换数据源）
  ↓
匹配兑换项目（通过his_item_codes）
  ↓
显示待缴费项目列表
  ↓
用户选择要兑换的项目
  ↓
检查积分是否充足
  ↓
执行积分兑换（扣减积分）
  ↓
调用HIS收费接口（HTTP请求）
  ↓
更新待缴费项目状态
  ↓
记录兑换和收费结果
```

---

## API 接口说明

### HIS系统对接

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/points/callback/his/registration` | POST | 挂号积分处理 |
| `/api/points/callback/his/payment` | POST | 缴费积分处理 |
| `/api/points/callback/his/refund` | POST | 退费积分处理 |
| `/points/his-exchange/query-with-exchange/{ghlsh}` | GET | 查询待缴费项目（含可兑换项目） |
| `/points/his-exchange/exchange` | POST | 积分兑换 |

### 公卫系统对接

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/points/callback/gw/sign` | POST | 家庭医生签约 |
| `/api/points/callback/gw/servicePackage` | POST | 服务包购买 |

### 积分查询

| 接口 | 方法 | 说明 |
|------|------|------|
| `/points/account/patient/{patientId}` | GET | 查询患者积分 |

---

## 积分计算规则

| 场景 | 积分计算 |
|------|----------|
| 挂号 | 固定 10 分 |
| 普通科室缴费 | 金额 × 50%（不含药品） |
| 特殊科室缴费 | 金额 × 50%（含药品） |
| 家庭医生签约 | 固定 10 分 |
| 服务包购买 | 金额 × 100% |
| 退费 | 退回原积分 |

---

## 相关文档

- [积分系统对接接口文档](../doc/积分系统对接接口文档.md)
- [HIS待缴费积分兑换功能说明](../HIS待缴费积分兑换功能说明.md)
- [HIS待缴费积分兑换-快速开始](../HIS待缴费积分兑换-快速开始.md)
- [积分系统菜单SQL](../sql/积分系统菜单SQL.sql)
- [积分系统完整菜单SQL（含HIS兑换）](../sql/积分系统完整菜单SQL（含HIS兑换）.sql)

---

## 技术栈

- Vue 3
- Element Plus
- Vite
- Pinia（状态管理）
- Vue Router

## 项目结构

```
ruoyi-ui/
├── public/              # 静态资源
├── src/
│   ├── api/            # API 接口
│   │   └── points/     # 积分模块接口
│   ├── assets/         # 资源文件
│   ├── components/     # 公共组件
│   ├── layout/         # 布局组件
│   ├── router/         # 路由配置
│   ├── utils/          # 工具函数
│   └── views/          # 页面视图
│       └── points/     # 积分管理页面
├── README.md
└── package.json
```
