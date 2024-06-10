const fs = require("fs");
const path = require("path");

const ignoredDirectories = ["node_modules", ".git", ".next"];
const validExtensions = [".js", ".jsx", ".ts", ".tsx"];
const baseDirectory = "./";

function compressWhitespace(str) {
  const whitespaceRegex = /\s+/g;
  return str.replace(whitespaceRegex, " ").trim();
}

function isIgnoredDirectory(dirName) {
  return ignoredDirectories.includes(dirName);
}

function traverseDirectory(dirPath) {
  fs.readdir(dirPath, (error, entries) => {
    if (error) {
      console.error("Failed to read directory:", error);
      return;
    }

    entries.forEach((entry) => {
      const entryPath = path.join(dirPath, entry);

      fs.stat(entryPath, (error, stats) => {
        if (error) {
          console.error("Failed to get stats:", error);
          return;
        }

        if (stats.isDirectory()) {
          if (!isIgnoredDirectory(entry)) {
            traverseDirectory(entryPath);
          }
        } else if (validExtensions.includes(path.extname(entry))) {
          fs.readFile(entryPath, "utf8", (error, content) => {
            if (error) {
              console.error("Failed to read file:", error);
              return;
            }

            const updatedContent = content.replace(
              /className="(.*?)"/g,
              (match, className) => {
                const cleanedClassName = compressWhitespace(className);
                return `className="${cleanedClassName}"`;
              }
            );

            fs.writeFile(entryPath, updatedContent, "utf8", (error) => {
              if (error) {
                console.error("Failed to write file:", error);
              } else {
                console.log(`Updated file: ${entry}`);
              }
            });
          });
        }
      });
    });
  });
}

const rootDir = process.argv[2] || baseDirectory;

traverseDirectory(rootDir);
