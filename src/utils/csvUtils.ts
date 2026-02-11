// CSV导入功能的工具函数

export interface ImportedBookmark {
  title: string;
  url: string;
  description?: string;
  category?: string;
  tags?: string[];
  folder?: string;
  cover?: string; // Cover image URL
}

export interface CSVParseResult {
  success: boolean;
  data: ImportedBookmark[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

/**
 * 解析CSV文件内容
 */
export const parseCSV = (csvContent: string): CSVParseResult => {
  const result: CSVParseResult = {
    success: false,
    data: [],
    errors: [],
    totalRows: 0,
    validRows: 0
  };

  try {
    // Handle Windows (\r\n), Unix (\n), and old Mac (\r) line endings
    const normalizedContent = csvContent
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // Parse CSV properly handling quoted fields with newlines
    const lines = parseCSVLines(normalizedContent);
    result.totalRows = lines.length - 1; // Subtract header row

    if (lines.length < 2) {
      result.errors.push('CSV file must contain at least one row of data');
      return result;
    }

    // 解析标题行
    const headers = parseCSVLine(lines[0]);

    // 检查必需的字段
    const titleIndex = findHeaderIndex(headers, ['title', 'name', '标题', '名称']);
    const urlIndex = findHeaderIndex(headers, ['url', 'link', 'href', '链接', '网址']);

    if (titleIndex === -1) {
      result.errors.push('CSV file must contain a title field (title or name)');
      return result;
    }

    if (urlIndex === -1) {
      result.errors.push('CSV file must contain a URL field (url, link, or href)');
      return result;
    }

    // 可选字段索引
    const descriptionIndex = findHeaderIndex(headers, ['description', 'desc', 'note', '描述', '说明', '备注']);
    const categoryIndex = findHeaderIndex(headers, ['recommendation', 'category', 'type', 'folder', 'notes', '分类', '类型', '文件夹', '推荐', '备注']);
    const tagsIndex = findHeaderIndex(headers, ['tags', 'keywords', 'labels', '标签', '关键词']);
    const coverIndex = findHeaderIndex(headers, ['cover', 'coverurl', 'cover_url', 'image', 'thumbnail', '封面', '图片']);

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const line = lines[i];

        // Skip lines that are only commas, whitespace, or empty
        if (!line || /^[\s,]*$/.test(line)) {
          continue;
        }

        const fields = parseCSVLine(line);

        const title = fields[titleIndex]?.trim() || '';
        const url = fields[urlIndex]?.trim();

        // Skip rows with missing URL (title is optional since we can fetch it from URL metadata)
        if (!url) {
          continue;
        }

        // 验证URL格式
        if (!isValidUrl(url)) {
          result.errors.push(`Row ${i}: invalid URL format - ${url}`);
          continue;
        }

        const bookmark: ImportedBookmark = {
          title, // May be empty - will be fetched from URL metadata if needed
          url,
          description: descriptionIndex !== -1 ? fields[descriptionIndex]?.trim() : undefined,
          category: categoryIndex !== -1 ? fields[categoryIndex]?.trim() : undefined,
          tags: tagsIndex !== -1 ? parseTags(fields[tagsIndex]) : undefined,
          cover: coverIndex !== -1 ? fields[coverIndex]?.trim() : undefined
        };

        result.data.push(bookmark);
        result.validRows++;
      } catch (error) {
        result.errors.push(`Row ${i}: parse error - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    result.success = result.validRows > 0;
    return result;
  } catch (error) {
    result.errors.push(`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
};

/**
 * Parse CSV content into lines, handling quoted fields with newlines
 */
const parseCSVLines = (content: string): string[] => {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      if (currentLine.trim() !== '') {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  // Add the last line if not empty
  if (currentLine.trim() !== '') {
    lines.push(currentLine);
  }

  return lines;
};

/**
 * Parse a single CSV line into fields
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 双引号转义
        current += '"';
        i++; // 跳过下一个引号
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field and trim any carriage returns
  result.push(current.replace(/\r/g, ''));

  // Trim all fields
  return result.map(field => field.trim());
};

/**
 * 查找标题索引（支持多种可能的字段名）
 */
const findHeaderIndex = (headers: string[], possibleNames: string[]): number => {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase().trim();
    if (possibleNames.some(name => header.includes(name.toLowerCase()))) {
      return i;
    }
  }
  return -1;
};

/**
 * 解析标签字段
 */
const parseTags = (tagsString: string | undefined): string[] | undefined => {
  if (!tagsString || !tagsString.trim()) {
    return undefined;
  }

  // 支持多种分隔符：逗号、分号、管道符
  return tagsString
    .split(/[,;|]/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};

/**
 * 验证URL格式
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    // 尝试添加协议前缀
    try {
      new URL('https://' + url);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * 规范化URL（添加协议前缀等）
 */
export const normalizeUrl = (url: string): string => {
  try {
    return new URL(url).toString();
  } catch {
    try {
      return new URL('https://' + url).toString();
    } catch {
      return url; // 返回原始URL
    }
  }
};

/**
 * 生成CSV模板
 */
export const generateCSVTemplate = (): string => {
  // Headers - URL first, title can be left blank (we'll auto-fetch it)
  const headers = ['url (required)', 'title (auto-fetched if blank)', 'recommendation (optional)', 'cover image url (optional)'];

  // Example row using Copus SEO data
  const example = [
    '"https://copus.network"',
    '"Copus - Internet Treasure Map"',
    '"A great platform for curating and discovering content"',
    '"https://copus.network/og-image.jpg"'
  ];

  // Generate 100 empty rows for easy filling
  const emptyRow = ',,,';
  const emptyRows = Array(100).fill(emptyRow).join('\n');

  return `${headers.join(',')}\n${example.join(',')}\n${emptyRows}`;
};

/**
 * 检测CSV文件编码并转换为UTF-8
 */
export const detectAndConvertEncoding = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      // 简单的编码检测和转换
      // 大部分现代浏览器已经能很好地处理UTF-8
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error('File read failed'));
    };

    // 使用UTF-8读取
    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * 从浏览器书签HTML文件中提取数据
 */
export const parseBookmarksHTML = (htmlContent: string): ImportedBookmark[] => {
  const bookmarks: ImportedBookmark[] = [];

  try {
    // 创建一个临时DOM来解析HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // 查找所有的书签链接
    const links = doc.querySelectorAll('a[href]');

    links.forEach(link => {
      const title = link.textContent?.trim();
      const url = link.getAttribute('href');

      if (title && url) {
        // 尝试从父级元素获取文件夹信息
        let folder = '';
        let parent = link.parentElement;
        while (parent) {
          if (parent.tagName === 'H3') {
            folder = parent.textContent?.trim() || '';
            break;
          }
          parent = parent.parentElement;
        }

        bookmarks.push({
          title,
          url: normalizeUrl(url),
          category: folder || undefined
        });
      }
    });
  } catch (error) {
    console.error('HTML书签解析失败:', error);
  }

  return bookmarks;
};