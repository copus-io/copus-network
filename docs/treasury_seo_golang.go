// ============================================================================
// Treasury SEO/AEO 后端实现 - Golang
// ============================================================================
//
// 文件结构：
// 1. Model - 数据模型
// 2. DTO - 请求/响应结构
// 3. Repository - 数据库操作
// 4. Service - 业务逻辑 + Claude API 调用
// 5. Handler - HTTP 处理器
// 6. Router - 路由注册
//
// ============================================================================

package treasury_seo

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// ============================================================================
// 1. Model - 数据模型
// ============================================================================

// TreasurySeoData AI生成的Treasury SEO数据结构
type TreasurySeoData struct {
	Description        string   `json:"description"`        // AI增强的描述
	Keywords           []string `json:"keywords"`           // 关键词列表
	Tags               []string `json:"tags"`               // 标签
	Category           string   `json:"category"`           // 分类: Technology, Art, Sports, Life
	KeyThemes          []string `json:"keyThemes"`          // 核心主题
	TargetAudience     string   `json:"targetAudience"`     // 目标受众
	CollectionInsight  string   `json:"collectionInsight"`  // 合集洞察
	CuratorCredibility string   `json:"curatorCredibility"` // 策展人可信度
}

// Space Treasury数据模型（添加seoDataByAi字段）
type Space struct {
	ID           int64          `json:"id" gorm:"primaryKey"`
	Name         string         `json:"name"`
	Namespace    string         `json:"namespace" gorm:"uniqueIndex"`
	Description  string         `json:"description"`
	FaceURL      string         `json:"faceUrl"`
	CoverURL     string         `json:"coverUrl"`
	SpaceType    int            `json:"spaceType"`
	ArticleCount int            `json:"articleCount"`
	UserID       int64          `json:"userId"`
	SeoDataByAi  sql.NullString `json:"seoDataByAi" gorm:"column:seo_data_by_ai;type:text"` // 新增字段
	CreatedAt    time.Time      `json:"createdAt"`
	UpdatedAt    time.Time      `json:"updatedAt"`
}

// SpaceArticle Treasury中的文章
type SpaceArticle struct {
	UUID      string `json:"uuid"`
	Title     string `json:"title"`
	Content   string `json:"content"`   // 策展人的推荐语
	TargetURL string `json:"targetUrl"` // 原文链接
}

// UserInfo 用户信息
type UserInfo struct {
	ID        int64  `json:"id"`
	Username  string `json:"username"`
	Namespace string `json:"namespace"`
	Bio       string `json:"bio"`
	FaceURL   string `json:"faceUrl"`
}

// ============================================================================
// 2. DTO - 请求/响应结构
// ============================================================================

// SetTreasurySeoRequest 设置Treasury SEO的请求
type SetTreasurySeoRequest struct {
	Namespace   string `json:"namespace" binding:"required"`
	SeoDataByAi string `json:"seoDataByAi" binding:"required"`
}

// SpaceInfoResponse 获取Treasury信息的响应（包含seoDataByAi）
type SpaceInfoResponse struct {
	ID           int64     `json:"id"`
	Name         string    `json:"name"`
	Namespace    string    `json:"namespace"`
	Description  string    `json:"description"`
	FaceURL      string    `json:"faceUrl"`
	CoverURL     string    `json:"coverUrl"`
	SpaceType    int       `json:"spaceType"`
	ArticleCount int       `json:"articleCount"`
	SeoDataByAi  string    `json:"seoDataByAi,omitempty"` // 新增：AI生成的SEO数据
	UserInfo     *UserInfo `json:"userInfo"`
}

// ApiResponse 通用API响应
type ApiResponse struct {
	Status int         `json:"status"`
	Msg    string      `json:"msg"`
	Data   interface{} `json:"data,omitempty"`
}

// ============================================================================
// 3. Repository - 数据库操作
// ============================================================================

type SpaceRepository struct {
	db *sql.DB
}

func NewSpaceRepository(db *sql.DB) *SpaceRepository {
	return &SpaceRepository{db: db}
}

// UpdateSeoDataByAi 更新Treasury的AI SEO数据
func (r *SpaceRepository) UpdateSeoDataByAi(ctx context.Context, namespace string, seoDataByAi string) error {
	query := `UPDATE space SET seo_data_by_ai = ?, updated_at = NOW() WHERE namespace = ?`
	_, err := r.db.ExecContext(ctx, query, seoDataByAi, namespace)
	return err
}

// GetSpaceByNamespace 根据namespace获取Treasury
func (r *SpaceRepository) GetSpaceByNamespace(ctx context.Context, namespace string) (*Space, error) {
	query := `SELECT id, name, namespace, description, face_url, cover_url, space_type,
	          article_count, user_id, seo_data_by_ai, created_at, updated_at
	          FROM space WHERE namespace = ?`

	var space Space
	err := r.db.QueryRowContext(ctx, query, namespace).Scan(
		&space.ID, &space.Name, &space.Namespace, &space.Description,
		&space.FaceURL, &space.CoverURL, &space.SpaceType, &space.ArticleCount,
		&space.UserID, &space.SeoDataByAi, &space.CreatedAt, &space.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &space, nil
}

// GetSpaceArticles 获取Treasury中的文章列表
func (r *SpaceRepository) GetSpaceArticles(ctx context.Context, spaceID int64, limit int) ([]SpaceArticle, error) {
	query := `SELECT a.uuid, a.title, a.content, a.target_url
	          FROM article a
	          JOIN space_article sa ON a.id = sa.article_id
	          WHERE sa.space_id = ?
	          ORDER BY sa.created_at DESC
	          LIMIT ?`

	rows, err := r.db.QueryContext(ctx, query, spaceID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var articles []SpaceArticle
	for rows.Next() {
		var article SpaceArticle
		if err := rows.Scan(&article.UUID, &article.Title, &article.Content, &article.TargetURL); err != nil {
			return nil, err
		}
		articles = append(articles, article)
	}
	return articles, nil
}

// GetUserByID 获取用户信息
func (r *SpaceRepository) GetUserByID(ctx context.Context, userID int64) (*UserInfo, error) {
	query := `SELECT id, username, namespace, bio, face_url FROM user WHERE id = ?`

	var user UserInfo
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&user.ID, &user.Username, &user.Namespace, &user.Bio, &user.FaceURL,
	)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// ============================================================================
// 4. Service - 业务逻辑 + Claude API 调用
// ============================================================================

type TreasurySeoService struct {
	repo             *SpaceRepository
	claudeAPIKey     string
	claudeAPIURL     string
	claudeModelID    string
}

func NewTreasurySeoService(repo *SpaceRepository, claudeAPIKey string) *TreasurySeoService {
	return &TreasurySeoService{
		repo:          repo,
		claudeAPIKey:  claudeAPIKey,
		claudeAPIURL:  "https://api.anthropic.com/v1/messages",
		claudeModelID: "claude-sonnet-4-20250514", // 或使用其他模型
	}
}

// GenerateAndSaveSeoData 生成并保存Treasury的SEO数据
func (s *TreasurySeoService) GenerateAndSaveSeoData(ctx context.Context, namespace string) error {
	// 1. 获取Treasury信息
	space, err := s.repo.GetSpaceByNamespace(ctx, namespace)
	if err != nil {
		return fmt.Errorf("failed to get space: %w", err)
	}

	// 2. 获取策展人信息
	curator, err := s.repo.GetUserByID(ctx, space.UserID)
	if err != nil {
		return fmt.Errorf("failed to get curator: %w", err)
	}

	// 3. 获取文章列表（最多10篇）
	articles, err := s.repo.GetSpaceArticles(ctx, space.ID, 10)
	if err != nil {
		return fmt.Errorf("failed to get articles: %w", err)
	}

	// 4. 调用Claude API生成SEO数据
	seoData, err := s.callClaudeAPI(ctx, space, curator, articles)
	if err != nil {
		return fmt.Errorf("failed to call Claude API: %w", err)
	}

	// 5. 序列化并保存
	seoDataJSON, err := json.Marshal(seoData)
	if err != nil {
		return fmt.Errorf("failed to marshal seo data: %w", err)
	}

	if err := s.repo.UpdateSeoDataByAi(ctx, namespace, string(seoDataJSON)); err != nil {
		return fmt.Errorf("failed to save seo data: %w", err)
	}

	return nil
}

// callClaudeAPI 调用Claude API生成SEO数据
func (s *TreasurySeoService) callClaudeAPI(ctx context.Context, space *Space, curator *UserInfo, articles []SpaceArticle) (*TreasurySeoData, error) {
	// 构建文章列表文本
	var articlesText strings.Builder
	for i, article := range articles {
		articlesText.WriteString(fmt.Sprintf("%d. Title: %s\n", i+1, article.Title))
		if article.Content != "" {
			articlesText.WriteString(fmt.Sprintf("   Curation Note: %s\n", article.Content))
		}
		if article.TargetURL != "" {
			articlesText.WriteString(fmt.Sprintf("   Original URL: %s\n", article.TargetURL))
		}
		articlesText.WriteString("\n")
	}

	// 构建Prompt
	prompt := fmt.Sprintf(`Analyze this curated collection (treasury) and generate comprehensive SEO/AEO metadata.
IMPORTANT: Generate ALL text output in the SAME LANGUAGE as the input content. If the treasury name and description are in Chinese, output in Chinese. If in English, output in English. Match the original language exactly.

TREASURY INFO:
- Name: %s
- Description: %s
- Article Count: %d

CURATOR INFO:
- Name: %s
- Bio: %s

CURATED ARTICLES (samples):
%s

Generate SEO metadata that:
1. Captures the essence and theme of this curated collection
2. Identifies common patterns and themes across the curated items
3. Explains what makes this collection valuable as a whole
4. Describes who would benefit from following this treasury
5. Incorporates the curator's perspective and expertise
6. Is optimized for both traditional search engines and AI answer engines
7. Determines the appropriate category based on the collection's content
8. Uses the SAME LANGUAGE as the input content for all text fields

Use the generate_treasury_seo_schema tool to provide structured output.`,
		space.Name,
		space.Description,
		space.ArticleCount,
		curator.Username,
		curator.Bio,
		articlesText.String(),
	)

	// 构建请求体
	requestBody := map[string]interface{}{
		"model":      s.claudeModelID,
		"max_tokens": 1024,
		"tools": []map[string]interface{}{
			{
				"name":        "generate_treasury_seo_schema",
				"description": "Generate structured SEO/AEO metadata for a curated collection",
				"input_schema": map[string]interface{}{
					"type": "object",
					"properties": map[string]interface{}{
						"description": map[string]interface{}{
							"type":        "string",
							"description": "AI-enhanced description of the collection (150-300 chars)",
						},
						"keywords": map[string]interface{}{
							"type":        "array",
							"items":       map[string]string{"type": "string"},
							"description": "5-10 keywords representing the collection's themes",
						},
						"tags": map[string]interface{}{
							"type":        "array",
							"items":       map[string]string{"type": "string"},
							"description": "3-5 short tags for categorization",
						},
						"category": map[string]interface{}{
							"type":        "string",
							"enum":        []string{"Technology", "Art", "Sports", "Life"},
							"description": "Primary category of the collection",
						},
						"keyThemes": map[string]interface{}{
							"type":        "array",
							"items":       map[string]string{"type": "string"},
							"description": "2-4 key themes that tie the collection together",
						},
						"targetAudience": map[string]interface{}{
							"type":        "string",
							"description": "Who would benefit from this treasury (50-100 chars)",
						},
						"collectionInsight": map[string]interface{}{
							"type":        "string",
							"description": "What this collection reveals about the topic (100-200 chars)",
						},
						"curatorCredibility": map[string]interface{}{
							"type":        "string",
							"description": "Why this curator's perspective matters (50-150 chars)",
						},
					},
					"required": []string{"description", "keywords", "category", "keyThemes", "targetAudience"},
				},
			},
		},
		"tool_choice": map[string]string{
			"type": "tool",
			"name": "generate_treasury_seo_schema",
		},
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": prompt,
			},
		},
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return nil, err
	}

	// 发送请求
	req, err := http.NewRequestWithContext(ctx, "POST", s.claudeAPIURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", s.claudeAPIKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Claude API error: %d - %s", resp.StatusCode, string(body))
	}

	// 解析响应
	var claudeResp ClaudeResponse
	if err := json.NewDecoder(resp.Body).Decode(&claudeResp); err != nil {
		return nil, err
	}

	// 从tool_use中提取SEO数据
	for _, content := range claudeResp.Content {
		if content.Type == "tool_use" && content.Name == "generate_treasury_seo_schema" {
			var seoData TreasurySeoData
			inputBytes, err := json.Marshal(content.Input)
			if err != nil {
				return nil, err
			}
			if err := json.Unmarshal(inputBytes, &seoData); err != nil {
				return nil, err
			}
			return &seoData, nil
		}
	}

	return nil, fmt.Errorf("no tool_use found in Claude response")
}

// ClaudeResponse Claude API响应结构
type ClaudeResponse struct {
	ID      string `json:"id"`
	Content []struct {
		Type  string                 `json:"type"`
		Name  string                 `json:"name,omitempty"`
		Input map[string]interface{} `json:"input,omitempty"`
		Text  string                 `json:"text,omitempty"`
	} `json:"content"`
	StopReason string `json:"stop_reason"`
}

// ============================================================================
// 5. Handler - HTTP 处理器
// ============================================================================

type TreasurySeoHandler struct {
	service *TreasurySeoService
	repo    *SpaceRepository
}

func NewTreasurySeoHandler(service *TreasurySeoService, repo *SpaceRepository) *TreasurySeoHandler {
	return &TreasurySeoHandler{
		service: service,
		repo:    repo,
	}
}

// SetTreasurySeo 手动设置Treasury SEO数据
// POST /client/author/space/setSeo
func (h *TreasurySeoHandler) SetTreasurySeo(c *gin.Context) {
	var req SetTreasurySeoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ApiResponse{
			Status: 0,
			Msg:    "Invalid request: " + err.Error(),
		})
		return
	}

	if err := h.repo.UpdateSeoDataByAi(c.Request.Context(), req.Namespace, req.SeoDataByAi); err != nil {
		c.JSON(http.StatusInternalServerError, ApiResponse{
			Status: 0,
			Msg:    "Failed to update SEO data: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, ApiResponse{
		Status: 1,
		Msg:    "success",
	})
}

// GenerateTreasurySeo 触发生成Treasury SEO数据
// POST /client/author/space/generateSeo
func (h *TreasurySeoHandler) GenerateTreasurySeo(c *gin.Context) {
	namespace := c.Query("namespace")
	if namespace == "" {
		c.JSON(http.StatusBadRequest, ApiResponse{
			Status: 0,
			Msg:    "namespace is required",
		})
		return
	}

	// 异步执行，避免阻塞请求
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()

		if err := h.service.GenerateAndSaveSeoData(ctx, namespace); err != nil {
			// 记录错误日志
			fmt.Printf("Failed to generate SEO for treasury %s: %v\n", namespace, err)
		}
	}()

	c.JSON(http.StatusOK, ApiResponse{
		Status: 1,
		Msg:    "SEO generation started",
	})
}

// GetSpaceInfo 获取Treasury信息（包含seoDataByAi）
// GET /client/article/space/info/:namespace
func (h *TreasurySeoHandler) GetSpaceInfo(c *gin.Context) {
	namespace := c.Param("namespace")
	if namespace == "" {
		c.JSON(http.StatusBadRequest, ApiResponse{
			Status: 0,
			Msg:    "namespace is required",
		})
		return
	}

	space, err := h.repo.GetSpaceByNamespace(c.Request.Context(), namespace)
	if err != nil {
		c.JSON(http.StatusNotFound, ApiResponse{
			Status: 0,
			Msg:    "Treasury not found",
		})
		return
	}

	curator, _ := h.repo.GetUserByID(c.Request.Context(), space.UserID)

	response := SpaceInfoResponse{
		ID:           space.ID,
		Name:         space.Name,
		Namespace:    space.Namespace,
		Description:  space.Description,
		FaceURL:      space.FaceURL,
		CoverURL:     space.CoverURL,
		SpaceType:    space.SpaceType,
		ArticleCount: space.ArticleCount,
		UserInfo:     curator,
	}

	// 添加seoDataByAi（如果存在）
	if space.SeoDataByAi.Valid {
		response.SeoDataByAi = space.SeoDataByAi.String
	}

	c.JSON(http.StatusOK, ApiResponse{
		Status: 1,
		Msg:    "success",
		Data:   response,
	})
}

// ============================================================================
// 6. Router - 路由注册
// ============================================================================

func RegisterRoutes(r *gin.Engine, db *sql.DB, claudeAPIKey string) {
	repo := NewSpaceRepository(db)
	service := NewTreasurySeoService(repo, claudeAPIKey)
	handler := NewTreasurySeoHandler(service, repo)

	// 作者相关路由（需要认证）
	author := r.Group("/client/author")
	{
		author.POST("/space/setSeo", handler.SetTreasurySeo)
		author.POST("/space/generateSeo", handler.GenerateTreasurySeo)
	}

	// 公开路由
	article := r.Group("/client/article")
	{
		article.GET("/space/info/:namespace", handler.GetSpaceInfo)
	}
}

// ============================================================================
// 7. 触发时机 - 在现有代码中调用
// ============================================================================

// 示例：在创建Treasury时触发SEO生成
/*
func (s *SpaceService) CreateSpace(ctx context.Context, req CreateSpaceRequest) (*Space, error) {
    // ... 现有创建逻辑 ...
    space, err := s.repo.CreateSpace(ctx, req)
    if err != nil {
        return nil, err
    }

    // 异步生成SEO数据
    go func() {
        ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
        defer cancel()
        s.seoService.GenerateAndSaveSeoData(ctx, space.Namespace)
    }()

    return space, nil
}
*/

// 示例：在更新Treasury描述时触发SEO生成
/*
func (s *SpaceService) UpdateSpace(ctx context.Context, namespace string, req UpdateSpaceRequest) error {
    // ... 现有更新逻辑 ...
    if err := s.repo.UpdateSpace(ctx, namespace, req); err != nil {
        return err
    }

    // 如果描述有变化，重新生成SEO数据
    if req.Description != "" {
        go func() {
            ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
            defer cancel()
            s.seoService.GenerateAndSaveSeoData(ctx, namespace)
        }()
    }

    return nil
}
*/

// ============================================================================
// 8. 数据库迁移 SQL
// ============================================================================

/*
-- 添加seo_data_by_ai字段到space表
ALTER TABLE space ADD COLUMN seo_data_by_ai TEXT;

-- 可选：添加索引（如果需要按SEO数据查询）
-- CREATE INDEX idx_space_seo_data ON space ((seo_data_by_ai IS NOT NULL));
*/
