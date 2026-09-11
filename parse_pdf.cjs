const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function main() {
  const filePath = 'D:/proj/InteractiveInvite/Dados Planilha/conv.pdf';
  const parser = new PDFParse({});
  
  // Try url-based loading
  await parser.load({ url: filePath });
  
  const info = await parser.getInfo();
  console.log('INFO:', JSON.stringify(info, null, 2));
  
  const numPages = info.numPages || info.pages || info.Pages;
  console.log('Pages:', numPages);
  
  const text = await parser.getText();
  console.log('\nFULL TEXT:\n', text);
  
  // Try screenshot for visual
  try {
    for (let i = 1; i <= (numPages || 1); i++) {
      const img = await parser.getScreenshot(i, 2.0);
      if (img) {
        fs.writeFileSync(`D:/proj/InteractiveInvite/Dados Planilha/conv_page${i}.png`, Buffer.from(img));
        console.log(`Screenshot page ${i} saved`);
      }
    }
  } catch(e) {
    console.log('Screenshot error:', e.message);
  }
  
  parser.destroy();
}
main().catch(e => console.error('Error:', e.message));
