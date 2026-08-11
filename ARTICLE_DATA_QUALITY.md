# Qualidade de dados em `normalized_data` — problemas pro backend

Doc de report pro time/serviço de backend (`editalis-api`), sobre o campo `normalized_data` que a API já retorna em `/api/v1/article/:slug` e `/api/v1/search`. Não é um pedido de endpoint novo — é uma lista de casos onde a extração/normalização está vindo errada ou vazia, encontrados navegando o site (ver [CLAUDE.md](CLAUDE.md), `Article.normalized_data` é populado "pra alguns artigos, não todos").

## 1. `process_number` às vezes é só o rótulo, sem o número

Exemplo real: [`pauta-de-julgamento-724190484`](https://editalis.vercel.app/artigo/pauta-de-julgamento-724190484) retorna `normalized_data.process_number: "nº"` — a extração pegou o rótulo "nº" do texto original mas não o número que vinha depois. O front exibe isso literalmente em "Detalhes da publicação" → **Processo: nº**, o que fica com cara de campo quebrado.

Esperado: ou extrai o número de verdade (esse artigo tem vários "Processo nº: 11020.735794/2019-22" no corpo — pode haver ambiguidade de qual processo vira o campo principal quando há mais de um, vale definir uma regra tipo "primeiro processo mencionado"), ou deixa o campo `null`/omitido quando não há número — não deve nunca voltar só o rótulo sem o valor.

## 2. Palavras-chave genéricas/erradas para o tipo de documento

Mesmo artigo (`pauta-de-julgamento-724190484`, um agendamento de julgamento de recursos tributários da Receita Federal — não tem nada de compra pública) retorna `normalized_data.keywords: ["equipamentos", "servicos"]`. Não faz sentido nenhum pro conteúdo — parece keyword genérica de fallback ou vazamento de classificação de outro artigo.

Esperado: quando o classificador não tem confiança nenhuma pro tipo de documento (aqui `doc_type: "portaria"`, que nem é bem uma portaria — é uma pauta de julgamento), melhor retornar `keywords: []` do que chutar termos de licitação/compra.

## 3. `summary` / `object_summary` praticamente nunca vêm preenchidos

O front já está pronto para mostrar um resumo (bloco "Resumo" na página do artigo, ver [ArticleContent.tsx](src/components/artigo/ArticleContent.tsx), e também nos resultados de busca em [SearchResultItem.tsx](src/components/busca/SearchResultItem.tsx)) usando `normalized_data.summary` (com fallback pra `object_summary`). Amostrando busca por "saude" (423 resultados, 10 primeiros por data) e o artigo [`aviso-de-homologacao-718854524`](https://editalis.vercel.app/artigo/aviso-de-homologacao-718854524) (um aviso de homologação bom candidato a resumo — parágrafo único gigante com 17 empresas vencedoras e centenas de números de lote), nenhum tinha `summary` nem `excerpt` preenchido.

Não é bug, é feature ainda não rodando/cobrindo os artigos — mas como o front já consome esse campo em dois lugares, vale priorizar a geração dele, principalmente pra documentos tipo `homologacao`/`licitacao` com texto longo e pouco escaneável (é exatamente esse tipo de artigo que mais se beneficia de um resumo).

## 4. (contexto, não é bug) Avisos de homologação viram parede de texto ilegível

Não é campo errado, é ausência de estrutura: `aviso-de-homologacao-718854524` lista 17 empresas vencedoras, cada uma com uma lista de "lotes" com centenas de números soltos, tudo em um único parágrafo sem quebras (o `content` raspado não tem `\n\n` nenhum). O front não tem como reconstruir isso — melhoraria bastante se a extração conseguisse estruturar, por empresa vencedora: `{ razao_social, cnpj, valor_total, lotes: [...] }`, mesmo que só pros doc_types de homologação/adjudicação. Registrando aqui como melhoria futura, não bloqueante.
