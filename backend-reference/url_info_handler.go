// Package handler provides HTTP handlers for the Copus API
// This file implements the URL metadata fetching endpoint for auto-fetching og:image
//
// Endpoint: GET /client/common/urlInfo?url=<encoded-url>
// Purpose: Fetch og:image and other metadata from external URLs for cover image auto-fill

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

	"golang.org/x/net/html"
)

// URLMetadata contains the extracted metadata from a URL
type URLMetadata struct {
	OgImage     string `json:"ogImage,omitempty"`
	Title       string `json:"title,omitempty"`
	Description string `json:"description,omitempty"`
	Favicon     string `json:"favicon,omitempty"`
}

// URLInfoResponse is the API response structure
type URLInfoResponse struct {
	Status int          `json:"status"`
	Msg    string       `json:"msg"`
	Data   *URLMetadata `json:"data,omitempty"`
}

// URLInfoHandler handles the /client/common/urlInfo endpoint
func URLInfoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Only allow GET requests
	if r.Method != http.MethodGet {
		sendURLInfoError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Get URL parameter
	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		sendURLInfoError(w, http.StatusBadRequest, "URL parameter is required")
		return
	}

	// Validate and normalize the URL
	normalizedURL, err := validateAndNormalizeURL(targetURL)
	if err != nil {
		sendURLInfoError(w, http.StatusBadRequest, fmt.Sprintf("Invalid URL: %v", err))
		return
	}

	// Fetch and parse the URL metadata
	metadata, err := fetchURLMetadata(normalizedURL)
	if err != nil {
		// Log the error but return empty metadata (graceful degradation)
		fmt.Printf("[URLInfo] Failed to fetch metadata for %s: %v\n", normalizedURL, err)
		sendURLInfoSuccess(w, &URLMetadata{})
		return
	}

	sendURLInfoSuccess(w, metadata)
}

// validateAndNormalizeURL validates the URL and adds protocol if missing
func validateAndNormalizeURL(rawURL string) (string, error) {
	rawURL = strings.TrimSpace(rawURL)

	// Don't allow empty URLs
	if rawURL == "" {
		return "", fmt.Errorf("URL cannot be empty")
	}

	// Add https:// if no protocol specified
	if !strings.HasPrefix(rawURL, "http://") && !strings.HasPrefix(rawURL, "https://") {
		rawURL = "https://" + rawURL
	}

	// Parse and validate the URL
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return "", fmt.Errorf("failed to parse URL: %v", err)
	}

	// Must have a valid host
	if parsedURL.Host == "" {
		return "", fmt.Errorf("URL must have a valid host")
	}

	// Block localhost and private IPs for security
	host := strings.ToLower(parsedURL.Hostname())
	if isPrivateHost(host) {
		return "", fmt.Errorf("private/local URLs are not allowed")
	}

	return parsedURL.String(), nil
}

// isPrivateHost checks if the host is localhost or a private IP
func isPrivateHost(host string) bool {
	privateHosts := []string{
		"localhost",
		"127.0.0.1",
		"0.0.0.0",
		"::1",
	}

	for _, ph := range privateHosts {
		if host == ph {
			return true
		}
	}

	// Check for private IP ranges
	privatePatterns := []string{
		`^10\.`,
		`^172\.(1[6-9]|2[0-9]|3[0-1])\.`,
		`^192\.168\.`,
		`^169\.254\.`,
	}

	for _, pattern := range privatePatterns {
		if matched, _ := regexp.MatchString(pattern, host); matched {
			return true
		}
	}

	return false
}

// fetchURLMetadata fetches the webpage and extracts metadata
func fetchURLMetadata(targetURL string) (*URLMetadata, error) {
	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Create HTTP request
	req, err := http.NewRequestWithContext(ctx, "GET", targetURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers to mimic a browser request
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; CopusBot/1.0; +https://copus.network)")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.5")

	// Create HTTP client with timeout and redirect policy
	client := &http.Client{
		Timeout: 10 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			// Allow up to 5 redirects
			if len(via) >= 5 {
				return fmt.Errorf("too many redirects")
			}
			return nil
		},
	}

	// Make the request
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch URL: %v", err)
	}
	defer resp.Body.Close()

	// Check status code
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("received status code %d", resp.StatusCode)
	}

	// Check content type - only parse HTML
	contentType := resp.Header.Get("Content-Type")
	if !strings.Contains(contentType, "text/html") && !strings.Contains(contentType, "application/xhtml") {
		return nil, fmt.Errorf("not an HTML page: %s", contentType)
	}

	// Limit response body size (5MB max)
	limitedReader := io.LimitReader(resp.Body, 5*1024*1024)

	// Parse HTML and extract metadata
	metadata, err := parseHTMLMetadata(limitedReader, targetURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %v", err)
	}

	return metadata, nil
}

// parseHTMLMetadata parses HTML and extracts Open Graph and other metadata
func parseHTMLMetadata(reader io.Reader, baseURL string) (*URLMetadata, error) {
	doc, err := html.Parse(reader)
	if err != nil {
		return nil, err
	}

	metadata := &URLMetadata{}
	var titleFromTag string

	// Parse base URL for resolving relative URLs
	parsedBaseURL, _ := url.Parse(baseURL)

	// Recursive function to traverse the HTML tree
	var traverse func(*html.Node)
	traverse = func(n *html.Node) {
		if n.Type == html.ElementNode {
			switch n.Data {
			case "meta":
				handleMetaTag(n, metadata)
			case "title":
				// Get title from <title> tag
				if n.FirstChild != nil {
					titleFromTag = strings.TrimSpace(n.FirstChild.Data)
				}
			case "link":
				handleLinkTag(n, metadata, parsedBaseURL)
			}
		}

		// Traverse children
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			traverse(c)
		}
	}

	traverse(doc)

	// Use <title> tag if og:title not found
	if metadata.Title == "" && titleFromTag != "" {
		metadata.Title = titleFromTag
	}

	// Resolve relative URLs to absolute URLs
	if metadata.OgImage != "" {
		metadata.OgImage = resolveURL(metadata.OgImage, parsedBaseURL)
	}
	if metadata.Favicon != "" {
		metadata.Favicon = resolveURL(metadata.Favicon, parsedBaseURL)
	}

	// Generate default favicon URL if not found
	if metadata.Favicon == "" && parsedBaseURL != nil {
		metadata.Favicon = fmt.Sprintf("%s://%s/favicon.ico", parsedBaseURL.Scheme, parsedBaseURL.Host)
	}

	return metadata, nil
}

// handleMetaTag extracts metadata from <meta> tags
func handleMetaTag(n *html.Node, metadata *URLMetadata) {
	var property, name, content string

	for _, attr := range n.Attr {
		switch strings.ToLower(attr.Key) {
		case "property":
			property = strings.ToLower(attr.Val)
		case "name":
			name = strings.ToLower(attr.Val)
		case "content":
			content = attr.Val
		}
	}

	// Open Graph tags
	switch property {
	case "og:image":
		if metadata.OgImage == "" {
			metadata.OgImage = content
		}
	case "og:title":
		if metadata.Title == "" {
			metadata.Title = content
		}
	case "og:description":
		if metadata.Description == "" {
			metadata.Description = content
		}
	}

	// Twitter Card tags (fallback)
	switch name {
	case "twitter:image":
		if metadata.OgImage == "" {
			metadata.OgImage = content
		}
	case "twitter:title":
		if metadata.Title == "" {
			metadata.Title = content
		}
	case "twitter:description":
		if metadata.Description == "" {
			metadata.Description = content
		}
	case "description":
		if metadata.Description == "" {
			metadata.Description = content
		}
	}
}

// handleLinkTag extracts favicon from <link> tags
func handleLinkTag(n *html.Node, metadata *URLMetadata, baseURL *url.URL) {
	var rel, href string

	for _, attr := range n.Attr {
		switch strings.ToLower(attr.Key) {
		case "rel":
			rel = strings.ToLower(attr.Val)
		case "href":
			href = attr.Val
		}
	}

	// Look for favicon
	if strings.Contains(rel, "icon") && href != "" && metadata.Favicon == "" {
		metadata.Favicon = href
	}
}

// resolveURL resolves a relative URL to an absolute URL
func resolveURL(rawURL string, baseURL *url.URL) string {
	if rawURL == "" {
		return ""
	}

	// Already absolute
	if strings.HasPrefix(rawURL, "http://") || strings.HasPrefix(rawURL, "https://") {
		return rawURL
	}

	// Protocol-relative URL
	if strings.HasPrefix(rawURL, "//") {
		return baseURL.Scheme + ":" + rawURL
	}

	// Relative URL
	if baseURL != nil {
		ref, err := url.Parse(rawURL)
		if err != nil {
			return rawURL
		}
		return baseURL.ResolveReference(ref).String()
	}

	return rawURL
}

// sendURLInfoSuccess sends a successful response
func sendURLInfoSuccess(w http.ResponseWriter, data *URLMetadata) {
	response := URLInfoResponse{
		Status: 1,
		Msg:    "success",
		Data:   data,
	}
	json.NewEncoder(w).Encode(response)
}

// sendURLInfoError sends an error response
func sendURLInfoError(w http.ResponseWriter, statusCode int, message string) {
	w.WriteHeader(statusCode)
	response := URLInfoResponse{
		Status: 0,
		Msg:    message,
	}
	json.NewEncoder(w).Encode(response)
}
