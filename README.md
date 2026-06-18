# SAP — Plataforma Independente

Sistema de Alerta Precoce de Seca e Desertificação  
**Stack:** React + Leaflet (Netlify) · FastAPI + GEE (Render) · dados em JSON no GitHub

---

## Arquitetura

```
Colab → GitHub (JSON) → Netlify (frontend)
                              ↓
                         Navegador
                         ↓       ↑ tiles
                       Render   GEE
                     (FastAPI)
```

Todos os serviços são **gratuitos**.

---

## Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Netlify](https://netlify.com)
- Conta no [Render](https://render.com)
- Acesso ao [Google Earth Engine](https://earthengine.google.com) (conta acadêmica/institucional)
- Node.js ≥ 18 e Python ≥ 3.10 (para desenvolvimento local)

---

## 1 · Configurar conta de serviço GEE

O backend precisa de uma **Service Account** para autenticar com o GEE sem interação humana.

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Selecione o projeto ligado ao seu GEE (`ee-ulissesalencar17`)
3. **IAM & Admin → Service Accounts → Create Service Account**
   - Nome: `sap-backend`
   - Role: não precisa de role no Cloud
4. Gere uma chave JSON: aba **Keys → Add Key → JSON**
5. Registre a service account no GEE:
   ```
   earthengine acl set -u sap-backend@seu-projeto.iam.gserviceaccount.com -r READER projects/ee-ulissesalencar17
   ```
   Ou via `ee.data.setAssetAcl()` no Python.

---

## 2 · Deploy do backend no Render

1. Faça push do repositório para o GitHub
2. Em [render.com](https://render.com): **New → Web Service**
   - Root directory: `backend`
   - Runtime: Python
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Em **Environment Variables**, adicione:
   - `GEE_SERVICE_ACCOUNT` → e-mail da service account (ex: `sap-backend@proj.iam.gserviceaccount.com`)
   - `GEE_KEY_JSON` → conteúdo completo do arquivo `.json` da chave (cole o JSON inteiro)
4. Clique em **Deploy**. Anote a URL (ex: `https://sap-gee-service.onrender.com`)

> **Nota:** o plano free do Render hiberna após 15 min de inatividade.  
> A primeira requisição após inatividade demora ~2s para acordar — normal.

---

## 3 · Adicionar o JSON de dados

Coloque o arquivo JSON do Contentful em:
```
frontend/public/data/monitor_seca.json
```

O arquivo deve seguir o schema `territorial-compact` com a estrutura:
```json
{
  "type": "territorial-compact",
  "defaultYear": "2026-04",
  "classes": [...],
  "locations": {...},
  "templates": {...},
  "years": {
    "2026-04": {
      "imageId": "projects/ee-ulissesalencar17/assets/...",
      "valuesScale": 1,
      "values": { "br": [...], "ac": [...], ... }
    }
  }
}
```

---

## 4 · Deploy do frontend no Netlify

1. Em [netlify.com](https://netlify.com): **Add new site → Import an existing project**
2. Conecte ao repositório GitHub
3. Configurações de build (já no `netlify.toml`, mas confirme):
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `frontend/dist`
4. **Site configuration → Environment variables → Add variable:**
   - `VITE_RENDER_URL` = URL do Render do passo 2
5. Clique em **Deploy site**

O site estará em: `https://seu-site.netlify.app`

---

## 5 · Desenvolvimento local

```bash
# Backend
cd backend
pip install -r requirements.txt
earthengine authenticate          # só na primeira vez
uvicorn main:app --reload

# Frontend (outro terminal)
cd frontend
npm install
cp .env.example .env.local        # edite com a URL local do backend
npm run dev
```

Acesse: `http://localhost:5173`

---

## 6 · Atualizar dados (fluxo Colab → GitHub → Netlify)

1. Execute o notebook `SAP_Conversor_CSV_Contentful.ipynb` no Google Colab
2. O notebook gera o arquivo `contentful_estados_YYYY-MM.json`
3. Copie o conteúdo para `frontend/public/data/monitor_seca.json`
4. Faça commit e push para o GitHub
5. Netlify detecta o push e rebuilda automaticamente em ~1 min

> Dica: o notebook pode automatizar o commit via GitHub API — posso adicionar isso.

---

## Estrutura do projeto

```
sap-plataforma/
├── netlify.toml              ← config de deploy
├── README.md
├── backend/
│   ├── main.py               ← FastAPI + GEE auth
│   ├── requirements.txt
│   └── render.yaml           ← config Render
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/
    │   └── data/
    │       └── monitor_seca.json   ← ← ← você atualiza aqui
    └── src/
        ├── App.jsx
        ├── App.css
        └── components/
            ├── Map.jsx         ← Leaflet + GEE overlay
            ├── StatsPanel.jsx  ← painel lateral
            └── ClassChart.jsx  ← gráfico de barras
```

---

## Próximos passos sugeridos

- [ ] Suporte a escalas extras (regiões, biomas, municípios)
- [ ] Seletor de camada: IDT × Monitor de Seca
- [ ] Exportar relatório PDF por estado/período
- [ ] Commit automático do JSON via Colab + GitHub API
