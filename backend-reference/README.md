# URL Info Handler - Backend Reference

This directory contains the Go backend implementation for the URL metadata fetching endpoint.

## Endpoint

```
GET /client/common/urlInfo?url=<encoded-url>
```

## Purpose

Fetches Open Graph metadata (og:image, og:title, og:description) from external URLs to enable auto-fill of cover images on the Create/Curate page.

## Files

- `url_info_handler.go` - Main handler implementation
- `url_info_handler_test.go` - Unit tests

## Response Format

### Success Response
```json
{
  "status": 1,
  "msg": "success",
  "data": {
    "ogImage": "https://example.com/image.jpg",
    "title": "Page Title",
    "description": "Page description",
    "favicon": "https://example.com/favicon.ico"
  }
}
```

### Error Response
```json
{
  "status": 0,
  "msg": "Error message here"
}
```

## Integration

### With Gin Router

```go
import (
    "github.com/gin-gonic/gin"
    "your-project/handler"
)

func SetupRoutes(r *gin.Engine) {
    // Wrap the standard http.HandlerFunc for Gin
    r.GET("/client/common/urlInfo", gin.WrapF(handler.URLInfoHandler))
}
```

### With Standard HTTP Router

```go
import (
    "net/http"
    "your-project/handler"
)

func main() {
    http.HandleFunc("/client/common/urlInfo", handler.URLInfoHandler)
    http.ListenAndServe(":8080", nil)
}
```

### With Chi Router

```go
import (
    "github.com/go-chi/chi/v5"
    "your-project/handler"
)

func SetupRoutes() *chi.Mux {
    r := chi.NewRouter()
    r.Get("/client/common/urlInfo", handler.URLInfoHandler)
    return r
}
```

## Security Features

1. **Private IP Blocking** - Prevents SSRF attacks by blocking requests to:
   - localhost, 127.0.0.1, 0.0.0.0
   - Private IP ranges (10.x.x.x, 172.16-31.x.x, 192.168.x.x)

2. **Request Timeout** - 10 second timeout for external requests

3. **Response Size Limit** - Max 5MB response body

4. **Redirect Limit** - Max 5 redirects followed

5. **Content-Type Check** - Only parses HTML content

## Dependencies

```go
require golang.org/x/net v0.x.x  // For HTML parsing
```

## Testing

```bash
cd backend-reference
go test -v
```

## Example Usage

```bash
# Test locally
curl "http://localhost:8080/client/common/urlInfo?url=https://github.com"

# Response
{
  "status": 1,
  "msg": "success",
  "data": {
    "ogImage": "https://github.githubassets.com/images/modules/open_graph/github-logo.png",
    "title": "GitHub",
    "description": "GitHub is where over 100 million developers shape the future of software...",
    "favicon": "https://github.com/favicon.ico"
  }
}
```

## Frontend Integration

The frontend (Create.tsx) calls this endpoint after URL validation passes:

```typescript
// authService.ts
static async fetchUrlMetadata(url: string): Promise<{
  ogImage?: string;
  title?: string;
  description?: string;
  favicon?: string;
}> {
  const response = await apiRequest(`/client/common/urlInfo?url=${encodeURIComponent(url)}`, {
    method: 'GET',
    requiresAuth: false,
  });

  return {
    ogImage: response.data?.ogImage,
    title: response.data?.title,
    description: response.data?.description,
    favicon: response.data?.favicon,
  };
}
```

## Performance Considerations

1. **Caching** - Consider adding Redis caching for frequently requested URLs
2. **Rate Limiting** - Add rate limiting to prevent abuse
3. **Async Processing** - For high traffic, consider using a job queue

### Example with Caching

```go
func URLInfoHandlerWithCache(cache *redis.Client) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        targetURL := r.URL.Query().Get("url")

        // Check cache first
        cacheKey := "urlinfo:" + targetURL
        cached, err := cache.Get(context.Background(), cacheKey).Result()
        if err == nil {
            w.Header().Set("Content-Type", "application/json")
            w.Write([]byte(cached))
            return
        }

        // Fetch and cache for 1 hour
        metadata, _ := fetchURLMetadata(targetURL)
        jsonData, _ := json.Marshal(URLInfoResponse{Status: 1, Msg: "success", Data: metadata})
        cache.Set(context.Background(), cacheKey, jsonData, time.Hour)

        w.Header().Set("Content-Type", "application/json")
        w.Write(jsonData)
    }
}
```
