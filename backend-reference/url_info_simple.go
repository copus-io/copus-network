// Simple regex-based URL metadata extractor
// This is a simpler alternative that uses regex instead of HTML parsing
// Often more reliable for meta tag extraction

package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
)

// Regex patterns for extracting meta tags
var (
	// Match og:image - handles various attribute orders and quotes
	ogImageRegex = regexp.MustCompile(`(?i)<meta[^>]*property\s*=\s*["']og:image["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>|<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:image["'][^>]*>`)

	// Match og:title
	ogTitleRegex = regexp.MustCompile(`(?i)<meta[^>]*property\s*=\s*["']og:title["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>|<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:title["'][^>]*>`)

	// Match og:description
	ogDescRegex = regexp.MustCompile(`(?i)<meta[^>]*property\s*=\s*["']og:description["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>|<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*property\s*=\s*["']og:description["'][^>]*>`)

	// Match <title> tag
	titleTagRegex = regexp.MustCompile(`(?i)<title[^>]*>([^<]+)</title>`)

	// Match twitter:image (fallback)
	twitterImageRegex = regexp.MustCompile(`(?i)<meta[^>]*name\s*=\s*["']twitter:image["'][^>]*content\s*=\s*["']([^"']+)["'][^>]*>|<meta[^>]*content\s*=\s*["']([^"']+)["'][^>]*name\s*=\s*["']twitter:image["'][^>]*>`)

	// Match favicon
	faviconRegex = regexp.MustCompile(`(?i)<link[^>]*rel\s*=\s*["'][^"']*icon[^"']*["'][^>]*href\s*=\s*["']([^"']+)["'][^>]*>`)
)

// SimpleURLMetadata contains the extracted metadata
type SimpleURLMetadata struct {
	OgImage     string `json:"ogImage"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Favicon     string `json:"favicon"`
}

// SimpleURLInfoHandler is a simpler regex-based implementation
func SimpleURLInfoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": 0,
			"msg":    "Method not allowed",
		})
		return
	}

	// Get URL parameter - support both "url" and "targetUrl"
	targetURL := r.URL.Query().Get("targetUrl")
	if targetURL == "" {
		targetURL = r.URL.Query().Get("url")
	}
	if targetURL == "" {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": 0,
			"msg":    "targetUrl parameter is required",
		})
		return
	}

	// Add https:// if missing
	if !strings.HasPrefix(targetURL, "http://") && !strings.HasPrefix(targetURL, "https://") {
		targetURL = "https://" + targetURL
	}

	// Fetch the page
	htmlContent, err := fetchPage(targetURL)
	if err != nil {
		fmt.Printf("[URLInfo] Failed to fetch %s: %v\n", targetURL, err)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status": 1,
			"msg":    "success",
			"data": SimpleURLMetadata{
				OgImage:     "",
				Title:       "",
				Description: "",
				Favicon:     "",
			},
		})
		return
	}

	// Extract metadata using regex
	metadata := extractMetadataRegex(htmlContent, targetURL)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": 1,
		"msg":    "success",
		"data":   metadata,
	})
}

func fetchPage(targetURL string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "GET", targetURL, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; CopusBot/1.0)")
	req.Header.Set("Accept", "text/html,application/xhtml+xml")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("status %d", resp.StatusCode)
	}

	// Read up to 1MB
	body, err := io.ReadAll(io.LimitReader(resp.Body, 1024*1024))
	if err != nil {
		return "", err
	}

	return string(body), nil
}

func extractMetadataRegex(html, baseURL string) SimpleURLMetadata {
	metadata := SimpleURLMetadata{}

	// Extract og:image
	if matches := ogImageRegex.FindStringSubmatch(html); len(matches) > 0 {
		for i := 1; i < len(matches); i++ {
			if matches[i] != "" {
				metadata.OgImage = matches[i]
				break
			}
		}
	}

	// Fallback to twitter:image if no og:image
	if metadata.OgImage == "" {
		if matches := twitterImageRegex.FindStringSubmatch(html); len(matches) > 0 {
			for i := 1; i < len(matches); i++ {
				if matches[i] != "" {
					metadata.OgImage = matches[i]
					break
				}
			}
		}
	}

	// Extract og:title
	if matches := ogTitleRegex.FindStringSubmatch(html); len(matches) > 0 {
		for i := 1; i < len(matches); i++ {
			if matches[i] != "" {
				metadata.Title = matches[i]
				break
			}
		}
	}

	// Fallback to <title> tag
	if metadata.Title == "" {
		if matches := titleTagRegex.FindStringSubmatch(html); len(matches) > 1 {
			metadata.Title = strings.TrimSpace(matches[1])
		}
	}

	// Extract og:description
	if matches := ogDescRegex.FindStringSubmatch(html); len(matches) > 0 {
		for i := 1; i < len(matches); i++ {
			if matches[i] != "" {
				metadata.Description = matches[i]
				break
			}
		}
	}

	// Extract favicon
	if matches := faviconRegex.FindStringSubmatch(html); len(matches) > 1 {
		metadata.Favicon = matches[1]
	}

	// Resolve relative URLs
	if parsedBase, err := url.Parse(baseURL); err == nil {
		metadata.OgImage = resolveRelativeURL(metadata.OgImage, parsedBase)
		metadata.Favicon = resolveRelativeURL(metadata.Favicon, parsedBase)

		// Default favicon
		if metadata.Favicon == "" {
			metadata.Favicon = fmt.Sprintf("%s://%s/favicon.ico", parsedBase.Scheme, parsedBase.Host)
		}
	}

	return metadata
}

func resolveRelativeURL(rawURL string, base *url.URL) string {
	if rawURL == "" || strings.HasPrefix(rawURL, "http") {
		return rawURL
	}
	if strings.HasPrefix(rawURL, "//") {
		return base.Scheme + ":" + rawURL
	}
	if ref, err := url.Parse(rawURL); err == nil {
		return base.ResolveReference(ref).String()
	}
	return rawURL
}
