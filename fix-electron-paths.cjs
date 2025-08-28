const fs = require('fs');
const path = require('path');

function fixHtmlFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 修复所有 /_next/ 路径为相对路径
    content = content.replace(/\/_next\//g, './_next/');
    content = content.replace(/href="\/favicon.ico"/g, 'href="./favicon.ico"');
    content = content.replace(/href="\/images\//g, 'href="./images/');
    content = content.replace(/src="\/images\//g, 'src="./images/');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed paths in: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.html')) {
      fixHtmlFile(filePath);
    }
  }
}

// 修复 out 目录下的所有 HTML 文件
const outDir = './out';
if (fs.existsSync(outDir)) {
  console.log('Fixing Electron paths in HTML files...');
  walkDirectory(outDir);
  console.log('Done!');
} else {
  console.error('Out directory not found. Please run npm run next-build first.');
}