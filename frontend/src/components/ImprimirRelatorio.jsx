import { usePreferencias } from '../contexts/PreferenciasContext';

const ImprimirRelatorio = ({ dados, tipo }) => {
  const { preferencias } = usePreferencias();

  const gerarHTML = () => {
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let conteudo = '';

    if (tipo === 'exames') {
      conteudo = `
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Funcionário</th>
              <th>Data</th>
              <th>Tipo</th>
              <th>Resultado</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${dados.map(exame => `
              <tr>
                <td>${exame.empresa_nome || '-'}</td>
                <td>${exame.funcionario_nome}</td>
                <td>${new Date(exame.data_atendimento).toLocaleDateString('pt-BR')}</td>
                <td>${exame.tipo_exame}</td>
                <td>${exame.resultado || '-'}</td>
                <td>${exame.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tipo === 'empresas') {
      conteudo = `
        <table>
          <thead>
            <tr>
              <th>Razão Social</th>
              <th>CNPJ</th>
              <th>E-mail</th>
              <th>Código SOC</th>
            </tr>
          </thead>
          <tbody>
            ${dados.map(empresa => `
              <tr>
                <td>${empresa.razao_social}</td>
                <td>${empresa.cnpj || '-'}</td>
                <td>${empresa.email_padrao || '-'}</td>
                <td>${empresa.codigo_soc || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tipo === 'clinicas') {
      conteudo = `
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CNPJ</th>
              <th>Tipo de Integração</th>
              <th>Contato</th>
            </tr>
          </thead>
          <tbody>
            ${dados.map(clinica => `
              <tr>
                <td>${clinica.nome}</td>
                <td>${clinica.cnpj || '-'}</td>
                <td>${clinica.tipo_integracao}</td>
                <td>${clinica.email_contato || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório - AST Assessoria</title>
        <style>
          @page {
            size: A4;
            margin: 2cm;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: ${preferencias.fontFamily}, sans-serif;
            font-size: ${preferencias.fontSize};
            color: #333;
          }

          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2c3e50;
          }

          .logo {
            max-width: 200px;
            max-height: 80px;
            margin-bottom: 15px;
            object-fit: contain;
            display: block;
            margin-left: auto;
            margin-right: auto;
          }

          .header h1 {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 5px;
          }

          .header p {
            color: #7f8c8d;
            font-size: 14px;
          }

          .info-relatorio {
            background-color: #f8f9fa;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
          }

          .info-relatorio p {
            margin: 5px 0;
            font-size: 13px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          thead {
            background-color: #2c3e50;
            color: white;
          }

          th, td {
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
            font-size: inherit;
          }

          th {
            font-weight: 600;
          }

          tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }

          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #7f8c8d;
            font-size: 11px;
          }

          @media print {
            .no-print {
              display: none;
            }

            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${preferencias.logo ? `<img src="${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${preferencias.logo}" alt="Logo" class="logo">` : ''}
          <h1>AST Assessoria - Central de Resultados</h1>
          <p>Relatório de ${tipo === 'exames' ? 'Exames' : tipo === 'empresas' ? 'Empresas' : 'Clínicas'}</p>
        </div>

        <div class="info-relatorio">
          <p><strong>Data de Emissão:</strong> ${dataAtual}</p>
          <p><strong>Total de Registros:</strong> ${dados.length}</p>
        </div>

        ${conteudo}

        <div class="footer">
          <p>AST Assessoria - Sistema de Gestão de Exames Ocupacionais</p>
          <p>Documento gerado automaticamente pelo sistema</p>
        </div>
      </body>
      </html>
    `;
  };

  const imprimir = () => {
    const htmlCompleto = gerarHTML();
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(htmlCompleto);
    janelaImpressao.document.close();
    
    janelaImpressao.onload = () => {
      setTimeout(() => {
        janelaImpressao.print();
      }, 250);
    };
  };

  return (
    <button className="btn btn-primary btn-small" onClick={imprimir} title="Imprimir Relatório">
      🖨️ Imprimir
    </button>
  );
};

export default ImprimirRelatorio;
