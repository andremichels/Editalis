# Qualidade de dados em `normalized_data` — RESOLVIDO

Doc de report original em `ARTICLE_DATA_QUALITY.md`. Status: 3/4 corrigidos, 1/4 planejado.

## 1. ✅ `process_number` às vezes é só o rótulo — CORRIGIDO

**Causa**: O regex capturava `group(2)` ("nº") como truthy, impedindo o fallback para `group(3)` (número real).  
**Fix**: `normalizer.py` agora prefere `group(3)` (número com ≥5 caracteres) e só usa o label como fallback.
**Arquivo**: `app/scraper/normalizer.py:159-171`

## 2. ✅ Palavras-chave genéricas/erradas — CORRIGIDO

**Causa**: KEYWORD_PATTERNS rodavam em TODOS os artigos, inclusive não-licitação (nomeações, portarias, pautas de julgamento).  
**Fix**: Keywords só são geradas para `doc_type` de procurement: licitacao, contrato, aditivo, dispensa, inexigibilidade, adjudicacao, homologacao, suspensao, revogacao.  
**Arquivo**: `app/scraper/normalizer.py:221-232`

## 3. ✅ `summary` nunca vem preenchido — BACKFILL CRIADO

**Causa**: O summarizer foi integrado no sync (SMA-304) mas artigos existentes (~30k) não foram processados.  
**Fix**: Script `generate_summaries.py` criado para backfill. Roda com `--limit 500` processa artigos com normalized_data sem summary.
**Arquivo**: `generate_summaries.py`

## 4. 📋 Homologações viram parede de texto — PLANEJADO

Estruturar por empresa vencedora + lotes para doc_types de homologação/adjudicação. Não implementado ainda — requer parser mais sofisticado. Registrado como melhoria futura.
