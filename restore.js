const fs = require('fs');
const readline = require('readline');
const path = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\3017e6df-3e79-4d40-b2c4-4872f953a3fa\\.system_generated\\logs\\transcript.jsonl';

async function extract() {
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let found = false;
  for await (const line of rl) {
    if (line.includes('"name":"view_file"') && line.includes('page.tsx')) {
      // Just scanning
    }
    if (line.includes('The following code has been modified to include a line number before every line') && line.includes('export default function LoginPage()')) {
      const parsed = JSON.parse(line);
      if (parsed.output) {
        // Extract the original content
        let content = parsed.output.split('The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.\n')[1];
        if (content) {
          content = content.split('\nThe above content shows the entire, complete file contents')[0];
          // Strip line numbers
          const lines = content.split('\n');
          const restored = lines.map(l => {
            const match = l.match(/^\d+: (.*)$/);
            return match ? match[1] : (l.match(/^\d+:$/) ? "" : l);
          }).join('\n');
          
          fs.writeFileSync('C:\\Users\\User\\creator\\creator-growth-ai\\src\\app\\login\\page.tsx', restored);
          console.log("Restored successfully!");
          found = true;
          break;
        }
      }
    }
  }
}
extract();
