# 后端需求：文章来源追踪接口

## 背景

前端和 Cloudflare Worker 已经实现了 referrer/UTM 数据采集，需要后端提供一个接口来存储这些数据，用于分析文章流量来源（搜索引擎、社交媒体分享、推广活动等）。

## 接口定义

**URL**: `POST /client/reader/article/trackView`

**Content-Type**: `application/json`

**无需鉴权**（匿名用户也需要追踪）

**请求体**:

```json
{
  "articleUuid": "fe4e71d254e33b2725e2615a4c983f5e",
  "referrer": "https://www.google.com/",
  "utmSource": "twitter",
  "utmMedium": "social",
  "utmCampaign": "launch-week",
  "source": "edge"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `articleUuid` | string | 是 | 文章 UUID |
| `referrer` | string | 否 | 来源页面完整 URL（如 `https://www.google.com/`） |
| `utmSource` | string | 否 | UTM 来源标记（如 `twitter`、`google`、`copus`） |
| `utmMedium` | string | 否 | UTM 媒介标记（如 `social`、`copy`、`cpc`） |
| `utmCampaign` | string | 否 | UTM 活动标记（如 `launch-week`） |
| `source` | string | 是 | 上报来源：`edge`（Cloudflare Worker 上报）或 `client`（前端 SPA 导航上报） |

## 存储建议

新建表 `t_article_view_source`，或在 `t_article_view` 上加字段：

| 列名 | 类型 | 说明 |
|------|------|------|
| `referrer` | VARCHAR(500) | 来源页面 URL |
| `utm_source` | VARCHAR(100) | UTM source |
| `utm_medium` | VARCHAR(100) | UTM medium |
| `utm_campaign` | VARCHAR(100) | UTM campaign |
| `tracking_source` | ENUM('edge','client') | 上报来源 |

## 响应

成功返回 `200` 即可，无需返回数据。前端对失败做了静默处理，不会重试。

## 调用方

1. **Cloudflare Worker**（`source: "edge"`）— 用户通过外部链接直接访问文章时触发，能捕获 HTTP `Referer` 头
2. **前端 Content 页面**（`source: "client"`）— 用户在站内 SPA 导航到文章时触发，捕获 `document.referrer`

两个来源可能对同一次访问都上报（外部链接访问时），建议后端按需去重或都保留用于分析。
