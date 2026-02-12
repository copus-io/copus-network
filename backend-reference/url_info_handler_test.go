// Package handler tests for URLInfoHandler
package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestURLInfoHandler_ValidURL(t *testing.T) {
	// Create a test server that returns HTML with og:image
	testServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(`
			<!DOCTYPE html>
			<html>
			<head>
				<title>Test Page</title>
				<meta property="og:title" content="OG Title">
				<meta property="og:description" content="OG Description">
				<meta property="og:image" content="https://example.com/image.jpg">
				<link rel="icon" href="/favicon.ico">
			</head>
			<body>Hello</body>
			</html>
		`))
	}))
	defer testServer.Close()

	// Create request
	req := httptest.NewRequest("GET", "/client/common/urlInfo?url="+testServer.URL, nil)
	w := httptest.NewRecorder()

	// Call handler
	URLInfoHandler(w, req)

	// Check response
	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response URLInfoResponse
	if err := json.NewDecoder(w.Body).Decode(&response); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if response.Status != 1 {
		t.Errorf("Expected status 1, got %d", response.Status)
	}

	if response.Data == nil {
		t.Fatal("Expected data in response")
	}

	if response.Data.OgImage != "https://example.com/image.jpg" {
		t.Errorf("Expected og:image, got %s", response.Data.OgImage)
	}

	if response.Data.Title != "OG Title" {
		t.Errorf("Expected 'OG Title', got %s", response.Data.Title)
	}
}

func TestURLInfoHandler_MissingURL(t *testing.T) {
	req := httptest.NewRequest("GET", "/client/common/urlInfo", nil)
	w := httptest.NewRecorder()

	URLInfoHandler(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400, got %d", w.Code)
	}

	var response URLInfoResponse
	json.NewDecoder(w.Body).Decode(&response)

	if response.Status != 0 {
		t.Errorf("Expected status 0 for error, got %d", response.Status)
	}
}

func TestURLInfoHandler_InvalidMethod(t *testing.T) {
	req := httptest.NewRequest("POST", "/client/common/urlInfo?url=https://example.com", nil)
	w := httptest.NewRecorder()

	URLInfoHandler(w, req)

	if w.Code != http.StatusMethodNotAllowed {
		t.Errorf("Expected status 405, got %d", w.Code)
	}
}

func TestURLInfoHandler_PrivateURL(t *testing.T) {
	testCases := []string{
		"http://localhost/test",
		"http://127.0.0.1/test",
		"http://192.168.1.1/test",
		"http://10.0.0.1/test",
	}

	for _, tc := range testCases {
		req := httptest.NewRequest("GET", "/client/common/urlInfo?url="+tc, nil)
		w := httptest.NewRecorder()

		URLInfoHandler(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status 400 for %s, got %d", tc, w.Code)
		}
	}
}

func TestValidateAndNormalizeURL(t *testing.T) {
	testCases := []struct {
		input    string
		expected string
		hasError bool
	}{
		{"https://example.com", "https://example.com", false},
		{"http://example.com", "http://example.com", false},
		{"example.com", "https://example.com", false},
		{"example.com/path?query=1", "https://example.com/path?query=1", false},
		{"", "", true},
		{"localhost", "", true},
		{"127.0.0.1", "", true},
		{"192.168.1.1", "", true},
	}

	for _, tc := range testCases {
		result, err := validateAndNormalizeURL(tc.input)

		if tc.hasError {
			if err == nil {
				t.Errorf("Expected error for %s", tc.input)
			}
		} else {
			if err != nil {
				t.Errorf("Unexpected error for %s: %v", tc.input, err)
			}
			if result != tc.expected {
				t.Errorf("For %s: expected %s, got %s", tc.input, tc.expected, result)
			}
		}
	}
}

func TestResolveURL(t *testing.T) {
	baseURL, _ := url.Parse("https://example.com/page/")

	testCases := []struct {
		input    string
		expected string
	}{
		{"https://cdn.example.com/image.jpg", "https://cdn.example.com/image.jpg"},
		{"//cdn.example.com/image.jpg", "https://cdn.example.com/image.jpg"},
		{"/images/photo.jpg", "https://example.com/images/photo.jpg"},
		{"image.jpg", "https://example.com/page/image.jpg"},
		{"../image.jpg", "https://example.com/image.jpg"},
	}

	for _, tc := range testCases {
		result := resolveURL(tc.input, baseURL)
		if result != tc.expected {
			t.Errorf("For %s: expected %s, got %s", tc.input, tc.expected, result)
		}
	}
}

// Import url package for tests
import "net/url"
