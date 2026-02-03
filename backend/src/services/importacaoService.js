const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');

const processarArquivoImportacao = async (filePath, mapeamento) => {
  const ext = filePath.split('.').pop().toLowerCase();
  
  try {
    let dados = [];

    if (ext === 'csv') {
      dados = await processarCSV(filePath);
    } else if (ext === 'xlsx' || ext === 'xls') {
      dados = processarExcel(filePath);
    } else {
      throw new Error('Formato de arquivo não suportado');
    }

    const dadosMapeados = dados.map(linha => mapearCampos(linha, mapeamento));
    
    return { sucesso: true, dados: dadosMapeados };
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    return { sucesso: false, erro: error.message };
  }
};

const processarCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

const processarExcel = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
};

const mapearCampos = (linha, mapeamento) => {
  const resultado = {};
  
  for (const [campoSistema, campoArquivo] of Object.entries(mapeamento)) {
    resultado[campoSistema] = linha[campoArquivo] || null;
  }
  
  return resultado;
};

module.exports = { processarArquivoImportacao };
